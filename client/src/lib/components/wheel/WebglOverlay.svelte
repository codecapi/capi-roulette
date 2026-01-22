<script lang="ts">
  import { onMount, onDestroy } from "svelte";

    let {
        isSpinning = false,
        isRevealed = false,
        resultColor = 'green',
    }: {
        isSpinning?: boolean;
        isRevealed?: boolean;
        resultColor?: 'red' | 'black' | 'green';
    } = $props();

    let canvasRef: HTMLCanvasElement | null = $state(null);
    let animationFrameId: number | null = $state(null);
    let gl: WebGLRenderingContext | null = $state(null);
    let program: WebGLProgram | null = $state(null);
    let timeUniformLocation: WebGLUniformLocation | null = $state(null);
    let resolutionUniformLocation: WebGLUniformLocation | null = $state(null);
    let isSpinningUniformLocation: WebGLUniformLocation | null = $state(null);
    let isRevealedUniformLocation: WebGLUniformLocation | null = $state(null);
    let celebrationTimeUniformLocation: WebGLUniformLocation | null = $state(null);
    let resultColorUniformLocation: WebGLUniformLocation | null = $state(null);
    let celebrationStartTime: number | null = $state(null);

    // Vertex shader source
    const vertex_shader_source = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    // Fragment shader source with top-down spotlights
    const fragment_shader_source = `
        precision mediump float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_is_spinning;
        uniform float u_is_revealed;
        uniform float u_celebration_time;
        uniform vec3 u_result_color;
        
        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            
            // White color by default
            vec3 white_color = vec3(1.0, 1.0, 1.0);
            
            // Determine spotlight color - white normally, result color when revealed
            vec3 spotlight_color = white_color;
            if (u_is_revealed > 0.5) {
                // Transition to result color when revealed
                float transition = smoothstep(0.0, 1.0, min(u_celebration_time, 1.0));
                spotlight_color = mix(white_color, u_result_color, transition);
            }
            
            // Create 5 spotlights from top (fully inlined)
            vec3 color = vec3(0.0);
            
            // Spotlight 1 - angle toward center (reduced angle effect)
            float spot1_dist_y = uv.y;
            float spot1_start_x = 0.15;
            float center_x = 0.5;
            float spot1_angle = (center_x - spot1_start_x) * spot1_dist_y * 0.5;
            float spot1_x = spot1_start_x + spot1_angle;
            if (u_is_spinning > 0.5) {
                spot1_x += sin(u_time * 2.0 + 1.0) * 0.03;
            }
            float spot1_dist_x = abs(uv.x - spot1_x);
            // Narrower cone that expands slightly as it goes down
            float spot1_cone = 0.05 + spot1_dist_y * 0.15;
            float spot1_intensity = 1.0 - smoothstep(0.0, spot1_cone, spot1_dist_x);
            // Fade from top (bright at y=0) to bottom (darker as y increases)
            float spot1_fade = 1.0 - smoothstep(0.0, 1.0, spot1_dist_y) * 0.5;
            float spot1_final = spot1_intensity * spot1_fade;
            if (u_is_spinning > 0.5) {
                spot1_final *= (1.0 + u_is_spinning * 0.4);
            }
            if (u_is_revealed > 0.5) {
                spot1_final *= (sin(u_celebration_time * 4.0) * 0.3 + 0.7);
            }
            color += spotlight_color * spot1_final * 0.5;
            
            // Spotlight 2 - angle toward center (reduced angle effect)
            float spot2_dist_y = uv.y;
            float spot2_start_x = 0.3;
            float spot2_angle = (0.5 - spot2_start_x) * spot2_dist_y * 0.5;
            float spot2_x = spot2_start_x + spot2_angle;
            if (u_is_spinning > 0.5) {
                spot2_x += sin(u_time * 2.0 + 2.0) * 0.03;
            }
            float spot2_dist_x = abs(uv.x - spot2_x);
            float spot2_cone = 0.05 + spot2_dist_y * 0.15;
            float spot2_intensity = 1.0 - smoothstep(0.0, spot2_cone, spot2_dist_x);
            float spot2_fade = 1.0 - smoothstep(0.0, 1.0, spot2_dist_y) * 0.5;
            float spot2_final = spot2_intensity * spot2_fade;
            if (u_is_spinning > 0.5) {
                spot2_final *= (1.0 + u_is_spinning * 0.4);
            }
            if (u_is_revealed > 0.5) {
                spot2_final *= (sin(u_celebration_time * 4.0) * 0.3 + 0.7);
            }
            color += spotlight_color * spot2_final * 0.5;
            
            // Spotlight 3
            float spot3_x = 0.5;
            float spot3_dist_y = uv.y;
            if (u_is_spinning > 0.5) {
                spot3_x += sin(u_time * 2.0 + 3.0) * 0.03;
            }
            float spot3_dist_x = abs(uv.x - spot3_x);
            float spot3_cone = 0.05 + spot3_dist_y * 0.15;
            float spot3_intensity = 1.0 - smoothstep(0.0, spot3_cone, spot3_dist_x);
            float spot3_fade = 1.0 - smoothstep(0.0, 1.0, spot3_dist_y) * 0.5;
            float spot3_final = spot3_intensity * spot3_fade;
            if (u_is_spinning > 0.5) {
                spot3_final *= (1.0 + u_is_spinning * 0.4);
            }
            if (u_is_revealed > 0.5) {
                spot3_final *= (sin(u_celebration_time * 4.0) * 0.3 + 0.7);
            }
            color += spotlight_color * spot3_final * 0.5;
            
            // Spotlight 4 - angle toward center (reduced angle effect)
            float spot4_dist_y = uv.y;
            float spot4_start_x = 0.7;
            float spot4_angle = (0.5 - spot4_start_x) * spot4_dist_y * 0.5;
            float spot4_x = spot4_start_x + spot4_angle;
            if (u_is_spinning > 0.5) {
                spot4_x += sin(u_time * 2.0 + 4.0) * 0.03;
            }
            float spot4_dist_x = abs(uv.x - spot4_x);
            float spot4_cone = 0.05 + spot4_dist_y * 0.15;
            float spot4_intensity = 1.0 - smoothstep(0.0, spot4_cone, spot4_dist_x);
            float spot4_fade = 1.0 - smoothstep(0.0, 1.0, spot4_dist_y) * 0.5;
            float spot4_final = spot4_intensity * spot4_fade;
            if (u_is_spinning > 0.5) {
                spot4_final *= (1.0 + u_is_spinning * 0.4);
            }
            if (u_is_revealed > 0.5) {
                spot4_final *= (sin(u_celebration_time * 4.0) * 0.3 + 0.7);
            }
            color += spotlight_color * spot4_final * 0.5;
            
            // Spotlight 5 - angle toward center (reduced angle effect)
            float spot5_dist_y = uv.y;
            float spot5_start_x = 0.85;
            float spot5_angle = (0.5 - spot5_start_x) * spot5_dist_y * 0.5;
            float spot5_x = spot5_start_x + spot5_angle;
            if (u_is_spinning > 0.5) {
                spot5_x += sin(u_time * 2.0 + 5.0) * 0.03;
            }
            float spot5_dist_x = abs(uv.x - spot5_x);
            float spot5_cone = 0.05 + spot5_dist_y * 0.15;
            float spot5_intensity = 1.0 - smoothstep(0.0, spot5_cone, spot5_dist_x);
            float spot5_fade = 1.0 - smoothstep(0.0, 1.0, spot5_dist_y) * 0.5;
            float spot5_final = spot5_intensity * spot5_fade;
            if (u_is_spinning > 0.5) {
                spot5_final *= (1.0 + u_is_spinning * 0.4);
            }
            if (u_is_revealed > 0.5) {
                spot5_final *= (sin(u_celebration_time * 4.0) * 0.3 + 0.7);
            }
            color += spotlight_color * spot5_final * 0.5;
            
            // Add some ambient light
            color += vec3(0.1, 0.1, 0.1);
            
            // Ensure minimum visibility
            if (length(color) < 0.1) {
                color = vec3(0.05, 0.05, 0.05);
            }
            
            // Soft edges
            float edge = smoothstep(0.0, 0.05, min(uv.x, min(uv.y, min(1.0 - uv.x, 1.0 - uv.y))));
            color *= edge;
            
            // Opacity
            float alpha = 0.7;
            if (u_is_spinning > 0.5) {
                alpha = 0.85;
            }
            if (u_is_revealed > 0.5) {
                alpha = 0.9;
            }
            
            gl_FragColor = vec4(color, alpha);
        }
    `;

    function create_shader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
        const shader = gl.createShader(type);
        if (!shader) return null;
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    function create_program(gl: WebGLRenderingContext, vertex_shader: WebGLShader, fragment_shader: WebGLShader): WebGLProgram | null {
        const program = gl.createProgram();
        if (!program) return null;
        
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }

    function setup_webgl() {
        if (!canvasRef || !gl) {
            console.error('WebGL setup failed: missing canvas or context');
            return;
        }

        // Set canvas size to fullscreen
        canvasRef.width = window.innerWidth * window.devicePixelRatio;
        canvasRef.height = window.innerHeight * window.devicePixelRatio;
        gl.viewport(0, 0, canvasRef.width, canvasRef.height);

        // Create shaders
        const vertex_shader = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_source);
        const fragment_shader = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_source);
        
        if (!vertex_shader || !fragment_shader) {
            console.error('WebGL setup failed: shader creation failed');
            return;
        }

        // Create program
        const new_program = create_program(gl, vertex_shader, fragment_shader);
        if (!new_program) {
            console.error('WebGL setup failed: program creation failed');
            return;
        }
        
        program = new_program;
        gl.useProgram(program);

        // Create fullscreen quad
        const position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1,
        ]), gl.STATIC_DRAW);

        const position_location = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(position_location);
        gl.vertexAttribPointer(position_location, 2, gl.FLOAT, false, 0, 0);

        // Get uniform locations
        timeUniformLocation = gl.getUniformLocation(program, 'u_time');
        resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        isSpinningUniformLocation = gl.getUniformLocation(program, 'u_is_spinning');
        isRevealedUniformLocation = gl.getUniformLocation(program, 'u_is_revealed');
        celebrationTimeUniformLocation = gl.getUniformLocation(program, 'u_celebration_time');
        resultColorUniformLocation = gl.getUniformLocation(program, 'u_result_color');

        // Enable blending for overlay effect - use additive blending for better fusion
        gl.enable(gl.BLEND);
        // Additive blending works well with CSS mix-blend-mode
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    }

    function color_to_vec3(color: 'red' | 'black' | 'green'): [number, number, number] {
        switch (color) {
            case 'red':
                return [1.0, 0.2, 0.2];
            case 'black':
                return [0.3, 0.3, 0.4];
            case 'green':
                return [0.2, 0.8, 0.3];
            default:
                return [0.2, 0.8, 0.3];
        }
    }

    function animate(time: number) {
        if (!gl || !program || !timeUniformLocation || !resolutionUniformLocation || !canvasRef) return;

        // Track celebration time
        if (isRevealed && celebrationStartTime === null) {
            celebrationStartTime = time;
        } else if (!isRevealed) {
            celebrationStartTime = null;
        }

        const celebration_time = celebrationStartTime ? (time - celebrationStartTime) * 0.001 : 0.0;

        // Update uniforms
        gl.uniform1f(timeUniformLocation, time * 0.001); // Convert to seconds
        gl.uniform2f(resolutionUniformLocation, canvasRef.width, canvasRef.height);
        
        if (isSpinningUniformLocation) {
            gl.uniform1f(isSpinningUniformLocation, isSpinning ? 1.0 : 0.0);
        }
        if (isRevealedUniformLocation) {
            gl.uniform1f(isRevealedUniformLocation, isRevealed ? 1.0 : 0.0);
        }
        if (celebrationTimeUniformLocation) {
            gl.uniform1f(celebrationTimeUniformLocation, celebration_time);
        }
        if (resultColorUniformLocation) {
            const color_vec = color_to_vec3(resultColor);
            gl.uniform3f(resultColorUniformLocation, color_vec[0], color_vec[1], color_vec[2]);
        }

        // Clear and draw
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameId = requestAnimationFrame(animate);
    }

    function handle_resize() {
        if (!canvasRef || !gl) return;
        // Use window dimensions for fullscreen
        canvasRef.width = window.innerWidth * window.devicePixelRatio;
        canvasRef.height = window.innerHeight * window.devicePixelRatio;
        gl.viewport(0, 0, canvasRef.width, canvasRef.height);
        if (resolutionUniformLocation && program) {
            gl.useProgram(program);
            gl.uniform2f(resolutionUniformLocation, canvasRef.width, canvasRef.height);
        }
    }

    onMount(() => {
        if (canvasRef) {
            const context = canvasRef.getContext('webgl', { alpha: true, premultipliedAlpha: false });
            if (context) {
                gl = context;
                setup_webgl();
                if (program) {
                    animationFrameId = requestAnimationFrame(animate);
                    window.addEventListener('resize', handle_resize);
                } else {
                    console.error('WebGL program not created, animation not started');
                }
            } else {
                console.error('WebGL context not available');
            }
        } else {
            console.error('Canvas ref not available');
        }
    });

    onDestroy(() => {
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
        }
        window.removeEventListener('resize', handle_resize);
    });
</script>

<div class="webgl-overlay">
    <canvas id="canvas" bind:this={canvasRef}></canvas>
</div>

<style>
    .webgl-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 0;
        opacity: 0.5;
    }
    
    .webgl-overlay canvas {
        width: 100%;
        height: 100%;
        display: block;
        mix-blend-mode: overlay;
    }
</style>