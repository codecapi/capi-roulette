<script lang="ts">
  import WebglOverlay from "./WebglOverlay.svelte";

	// Props
	let {
		onSpinComplete,
		onSpinStart,
		onNoMoreBets,
		onResultRevealed,
		spinDuration = 9000,
		overrideResult = null,
	}: {
		onSpinComplete?: (result: number) => void;
		onSpinStart?: (duration: number) => void;
		onNoMoreBets?: () => void;
		onResultRevealed?: (result: number) => void;
		spinDuration?: number;
		overrideResult?: number | null;
	} = $props();

	// European roulette wheel order (exact order from CodePen HTML)
	const WHEEL_NUMBERS = [
		32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
		31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, 0,
	];

	// Red numbers (from CodePen script.js)
	const RED_NUMBERS = [32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3];

	// State
	let isSpinning = $state(false);
	let spinTo = $state<number | null>(null);
	let isRest = $state(false);
	let isRevealed = $state(false);
	let maskText = $state('Place Your Bets');
	let resultNumber = $state(0);
	let resultColor = $state<'red' | 'black' | 'green'>('green');

	function getColor(num: number): 'red' | 'black' | 'green' {
		if (num === 0) return 'green';
		return RED_NUMBERS.includes(num) ? 'red' : 'black';
	}

	export function spin() {
		if (isSpinning) return;

		isSpinning = true;
		isRest = false;
		isRevealed = false;

		// Determine result: use override if provided, otherwise random (0-36)
		const randomNumber =
			overrideResult !== null ? overrideResult : Math.floor(Math.random() * 37);
		const color = getColor(randomNumber);

		// Set spin target (this triggers the CSS transition via data-spinto)
		spinTo = randomNumber;

		// Notify parent that spin started (for audio)
		onSpinStart?.(spinDuration);

		// Show "No More Bets" at half the timer
		setTimeout(() => {
			maskText = 'No More Bets';
			onNoMoreBets?.();
		}, spinDuration / 2);

		// Reset mask text slightly after spin completes
		setTimeout(() => {
			maskText = 'Place Your Bets';
		}, spinDuration + 500);

		// Reveal result when spin completes
		setTimeout(() => {
			isSpinning = false;
			isRest = true;

			resultNumber = randomNumber;
			resultColor = color;
			isRevealed = true;

			// Notify parent of result reveal (for audio announcement)
			onResultRevealed?.(randomNumber);

			// Notify parent of spin complete
			onSpinComplete?.(randomNumber);
		}, spinDuration);
	}

	export function reset() {
		if (isSpinning) return;

		spinTo = null;
		isRest = false;
		isRevealed = false;
		maskText = 'Place Your Bets';
	}
</script>

<div class="main-container">

	<div class="wheel-container">
		<WebglOverlay isSpinning={isSpinning} isRevealed={isRevealed} resultColor={resultColor} />
		<div class="main">
			<div class="background-image"/>
			<div class="plate" id="plate">
				<ul class="inner" class:rest={isRest} data-spinto={spinTo}>
					{#each WHEEL_NUMBERS as number}
					<li class="number">
						<label>
							<input type="radio" name="pit" value={number} />
							<span class="pit">{number}</span>
						</label>
					</li>
					{/each}
				</ul>
				<div class='inner-overlay'/>
				
			</div>
		</div>
		<div class="data" class:reveal={isRevealed}>
			<div class="data-inner">
				<div class="mask">{maskText}</div>
				<div class="result" style:background-color={resultColor}>
					<div class="result-number">{resultNumber}</div>
					<div class="result-color">{resultColor}</div>
				</div>
			</div>
		</div>
	</div>
</div>
<style>
	/* Reset styles for our component */

	.main-container {
		padding-bottom: 250px;
	}

	.wheel-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.inner-overlay {
		--wheel-width: 374px;
		--offset: -200px;
		position: absolute;
		left: calc(50% - (var(--wheel-width) + var(--offset)) / 2);
		top: calc((50% - (var(--wheel-width) + var(--offset)) / 2) );
		width: calc(var(--wheel-width) + var(--offset));
		height: calc(var(--wheel-width) + var(--offset));
		background-image: url('/img/wheel-center.png');
		background-position: center center;
		background-size: cover;
		z-index: 100;
		/* transform: rotateY(180deg); */
	}

	.main * {
		margin: 0;
		padding: 0;
		border: 0;
		font-size: 100%;
		font: inherit;
		vertical-align: baseline;
		box-sizing: border-box;
	}

	.main ul {
		list-style: none;
	}

	/* Number rotations - exact values from CodePen */
	.number:nth-child(1) {
		transform: rotateZ(9.72972973deg);
	}
	.number:nth-child(2) {
		transform: rotateZ(19.45945946deg);
	}
	.number:nth-child(3) {
		transform: rotateZ(29.18918919deg);
	}
	.number:nth-child(4) {
		transform: rotateZ(38.91891892deg);
	}
	.number:nth-child(5) {
		transform: rotateZ(48.64864865deg);
	}
	.number:nth-child(6) {
		transform: rotateZ(58.37837838deg);
	}
	.number:nth-child(7) {
		transform: rotateZ(68.10810811deg);
	}
	.number:nth-child(8) {
		transform: rotateZ(77.83783784deg);
	}
	.number:nth-child(9) {
		transform: rotateZ(87.56756757deg);
	}
	.number:nth-child(10) {
		transform: rotateZ(97.2972973deg);
	}
	.number:nth-child(11) {
		transform: rotateZ(107.02702703deg);
	}
	.number:nth-child(12) {
		transform: rotateZ(116.75675676deg);
	}
	.number:nth-child(13) {
		transform: rotateZ(126.48648649deg);
	}
	.number:nth-child(14) {
		transform: rotateZ(136.21621622deg);
	}
	.number:nth-child(15) {
		transform: rotateZ(145.94594595deg);
	}
	.number:nth-child(16) {
		transform: rotateZ(155.67567568deg);
	}
	.number:nth-child(17) {
		transform: rotateZ(165.40540541deg);
	}
	.number:nth-child(18) {
		transform: rotateZ(175.13513514deg);
	}
	.number:nth-child(19) {
		transform: rotateZ(184.86486486deg);
	}
	.number:nth-child(20) {
		transform: rotateZ(194.59459459deg);
	}
	.number:nth-child(21) {
		transform: rotateZ(204.32432432deg);
	}
	.number:nth-child(22) {
		transform: rotateZ(214.05405405deg);
	}
	.number:nth-child(23) {
		transform: rotateZ(223.78378378deg);
	}
	.number:nth-child(24) {
		transform: rotateZ(233.51351351deg);
	}
	.number:nth-child(25) {
		transform: rotateZ(243.24324324deg);
	}
	.number:nth-child(26) {
		transform: rotateZ(252.97297297deg);
	}
	.number:nth-child(27) {
		transform: rotateZ(262.7027027deg);
	}
	.number:nth-child(28) {
		transform: rotateZ(272.43243243deg);
	}
	.number:nth-child(29) {
		transform: rotateZ(282.16216216deg);
	}
	.number:nth-child(30) {
		transform: rotateZ(291.89189189deg);
	}
	.number:nth-child(31) {
		transform: rotateZ(301.62162162deg);
	}
	.number:nth-child(32) {
		transform: rotateZ(311.35135135deg);
	}
	.number:nth-child(33) {
		transform: rotateZ(321.08108108deg);
	}
	.number:nth-child(34) {
		transform: rotateZ(330.81081081deg);
	}
	.number:nth-child(35) {
		transform: rotateZ(340.54054054deg);
	}
	.number:nth-child(36) {
		transform: rotateZ(350.27027027deg);
	}

	/* Main container */
	.main {
		/* width: 374px; */
		margin: 0 auto;
		font-family: 'Roboto', sans-serif;
		padding: 150px;
		position: relative;
	}

	.background-image {
		--wheel-width: 374px;
		--offset: 130px;
		position: absolute;
		left: calc((50% - (var(--wheel-width) + var(--offset)) / 2) - 6px);
		top: calc((50% - (var(--wheel-width) + var(--offset)) / 2) - 7px);
		width: calc(var(--wheel-width) + var(--offset) + 12px);
		height: calc(var(--wheel-width) + var(--offset));
		background-image: url('/img/roulette.png');
		background-position: center center;
		background-size: cover;
	}

	/* Wheel plate */
	.plate {
		background-color: gray;
		width: 350px;
		height: 350px;
		margin: 12px;
		border-radius: 50%;
		position: relative;
		animation: rotate 48s infinite linear;
	}

	.plate:after,
	.plate:before {
		content: '';
		display: block;
		position: absolute;
		border-radius: 50%;
	}

	/* Gold outer rim */
	.plate:after {
		top: -6px;
		right: -6px;
		bottom: -6px;
		left: -6px;
		border: 6px solid silver;
		box-shadow:
			inset 0px 0px 0px 2px silver,
			0px 0px 0px 2px silver;
	}

	/* Inner dark circle */
	.plate:before {
		background: rgba(0, 0, 0, 0.65);
		border: 1px solid silver;
		box-shadow: inset 0px 0px 0px 2px #808080;
		top: 12%;
		left: 12%;
		right: 12%;
		bottom: 12%;
		z-index: 1;
	}

	/* Number segment (triangle using borders) */
	.number {
		width: 32px;
		height: 175px;
		display: inline-block;
		text-align: center;
		position: absolute;
		top: 0;
		left: calc(50% - (32px / 2));
		transform-origin: 50% 100%;
		background-color: transparent;
		border-left: 16px solid transparent;
		border-right: 16px solid transparent;
		border-top: 175px solid black;
		box-sizing: border-box;
	}

	/* Odd numbers are red */
	.number:nth-child(odd) {
		border-top-color: red;
	}

	/* 37th number (0) is green */
	.number:nth-child(37) {
		border-top-color: green;
	}

	/* Number text */
	.pit {
		color: #fff;
		padding-top: 12px;
		width: 32px;
		display: inline-block;
		font-size: 12px;
		transform: scale(1, 1.8);
		position: absolute;
		top: -175px;
		left: -16px;
	}

	/* Hide radio inputs */
	.number input {
		display: none;
	}

	/* Inner wheel container */
	.inner {
		display: block;
		height: 350px;
		width: 350px;
		position: relative;
	}

	.inner:after,
	.inner:before {
		content: '';
		display: block;
		position: absolute;
		border-radius: 50%;
	}

	/* Gray center circle */
	.inner:after {
		z-index: 3;
		top: 24%;
		right: 24%;
		bottom: 24%;
		left: 24%;
		background-color: #4d4d4d;
		border: 3px solid #808080;
	}

	/* Ball (bullet character positioned via pseudo-element) */
	.inner:before {
		top: 24%;
		bottom: 21%;
		left: 24%;
		right: 22%;
		content: '';
		color: #fff;
		font-size: 60px;
		z-index: 101;
		border-radius: 0;
	}

	/* Ball rest state */
	.inner.rest:before {
		transition:
			top 0.5s ease-in,
			right 0.5s ease-in,
			bottom 0.5s ease-in,
			left 0.5s ease-in;
		top: 25%;
		right: 25%;
		bottom: 24%;
		left: 25%;
	}

	/* Ball spin positions for each number - adjusted by +10deg to fix offset */
	.inner[data-spinto='1']:before {
		transform: rotateZ(-2592deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='2']:before {
		transform: rotateZ(-2764deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='3']:before {
		transform: rotateZ(-2840deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='4']:before {
		transform: rotateZ(-2783deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='5']:before {
		transform: rotateZ(-2632deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='6']:before {
		transform: rotateZ(-2724deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='7']:before {
		transform: rotateZ(-2516deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='8']:before {
		transform: rotateZ(-2663deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='9']:before {
		transform: rotateZ(-2554deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='10']:before {
		transform: rotateZ(-2642deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='11']:before {
		transform: rotateZ(-2683deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='12']:before {
		transform: rotateZ(-2858deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='13']:before {
		transform: rotateZ(-2704deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='14']:before {
		transform: rotateZ(-2572deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='15']:before {
		transform: rotateZ(-2803deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='16']:before {
		transform: rotateZ(-2612deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='17']:before {
		transform: rotateZ(-2745deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='18']:before {
		transform: rotateZ(-2535deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='19']:before {
		transform: rotateZ(-2793deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='20']:before {
		transform: rotateZ(-2582deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='21']:before {
		transform: rotateZ(-2774deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='22']:before {
		transform: rotateZ(-2544deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='23']:before {
		transform: rotateZ(-2652deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='24']:before {
		transform: rotateZ(-2622deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='25']:before {
		transform: rotateZ(-2754deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='26']:before {
		transform: rotateZ(-2830deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='27']:before {
		transform: rotateZ(-2714deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='28']:before {
		transform: rotateZ(-2867deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='29']:before {
		transform: rotateZ(-2525deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='30']:before {
		transform: rotateZ(-2674deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='31']:before {
		transform: rotateZ(-2563deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='32']:before {
		transform: rotateZ(-2812deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='33']:before {
		transform: rotateZ(-2602deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='34']:before {
		transform: rotateZ(-2735deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='35']:before {
		transform: rotateZ(-2489deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='36']:before {
		transform: rotateZ(-2693deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}
	.inner[data-spinto='0']:before {
		transform: rotateZ(-2821deg);
		transition: transform 9s ease-out;
		content: '\2022';
	}

	/* Wheel rotation animation */
	@keyframes rotate {
		0% {
			transform: rotateZ(0deg);
		}
		100% {
			transform: rotateZ(360deg);
		}
	}

	/* Data/result display container */
	.data {
		position: relative;
		border-radius: 50%;
		width: 100%;
		/* animation: rotate 48s reverse linear infinite; */
		/* perspective: 2000px; */
		z-index: 100;
	}

	.data .data-inner {
		position: relative;
		text-align: center;
		/* transition: transform 0.72s; */
		/* transform-style: preserve-3d; */
	}

	.data.reveal .data-inner {
		/* transform: rotateY(180deg); */
	}

	.data .mask,
	.data .result {
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		position: absolute;
		backface-visibility: hidden;
		border-radius: 50%;
		display: inline-block;
		width: 150px;
		height: 150px;
	}

	.data .mask {
		color: #fff;
		font-size: 24px;
		margin: auto;
		line-height: 1.4;
		padding-top: 36px;
		opacity: 1;
		transition: opacity 0.5s ease-in-out;
	}

	.data.reveal .mask {
		opacity: 0;
		visibility: hidden;
	}

	.data .result {
		left: 39%;
		background-color: green;
		color: white;
		/* transform: rotateY(180deg); */
		align-items: center;
		color: #fff;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.5s ease-in-out;
	}

	.data.reveal .result {
		opacity: 1;
		visibility: visible;
	}

	.data .result-number {
		font-size: 72px;
		font-weight: 500;
		line-height: 1.2;
		margin-top: 12px;
	}

	.data .result-color {
		text-transform: uppercase;
		font-size: 21px;
		line-height: 1;
	}

	/* Flip animation for result reveal */
	@keyframes flipin {
		0% {
			transform: rotateX(90deg);
		}
		100% {
			transform: rotateX(0deg);
		}
	}
</style>
