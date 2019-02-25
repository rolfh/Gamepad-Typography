var vm = new Vue({
	el: '#app',
	data() {
		return {
			gamepad: {},
			oldButtons: {},
			buttonMap: [
				'A',
				'B',
				'X',
				'Y',
				'L1',
				'R1',
				'L2',
				'R2',
				'Back',
				'Start',
				'LS',
				'RS',
				'UP',
				'Down',
				'Left',
				'Right'
			],
			axisMap: ['LX', 'LY', 'RX', 'RY'],
			value: 20,
			defaultFactor: 0.2,
			factors: {
				'font-size': 0.2,
				hue: 1,
				saturation: 0.3,
				lightness: 0.3,
				alpha: 0.01,
				'line-height': 0.025,
				'letter-spacing': 0.2,
				'margin-top': 0.2,
				'margin-bottom': 0.2
			},

			styles: [],
			currentSelector: 0,
			currentAttribute: 0
		}
	},
	mounted() {
		fetch('./styles.json')
			.then(blob => blob.json())
			.then(styles => (this.styles = styles))

		this.search()
	},
	methods: {
		search() {
			var controllerDiscovery = setInterval(() => {
				if (
					Array.from(navigator.getGamepads())
						.filter(gp => gp)
						.filter(gp => gp.mapping.includes('standard')).length
				) {
					console.info('"Standard" controller discovered!')
					clearInterval(controllerDiscovery)
					this.loop()
				} else {
					console.info('No "Standard" controller at this time')
				}
			}, 1000)
		},
		loop() {
			var localGP = Array.from(navigator.getGamepads()).filter(
				x => x && x.id.includes('STANDARD')
			)[0]

			if (!localGP) {
				this.search()
				return
			}

			this.gamepad = {
				buttons: localGP.buttons.map(button => button.value),
				axes: localGP.axes,
				vibration: localGP.vibrationActuator
			}

			if (
				this.styles[this.currentSelector].attributes[
					this.currentAttribute
				].type == 'float'
			) {
				var attrName = this.styles[this.currentSelector].attributes[
					this.currentAttribute
				].name
				this.styles[this.currentSelector].attributes[
					this.currentAttribute
				].value -= localGP.buttons[6].value * this.factors[attrName]

				this.styles[this.currentSelector].attributes[
					this.currentAttribute
				].value += localGP.buttons[7].value * this.factors[attrName]

				this.styles[this.currentSelector].attributes[
					this.currentAttribute
				].value = this.styles[this.currentSelector].attributes[
					this.currentAttribute
				].value.toFixed(6)

				if (
					this.styles[this.currentSelector].attributes[
						this.currentAttribute
					].hasOwnProperty('max') &&
					this.styles[this.currentSelector].attributes[
						this.currentAttribute
					].max <
						this.styles[this.currentSelector].attributes[
							this.currentAttribute
						].value
				) {
					this.styles[this.currentSelector].attributes[
						this.currentAttribute
					].value = this.styles[this.currentSelector].attributes[
						this.currentAttribute
					].max
				}
				if (
					this.styles[this.currentSelector].attributes[
						this.currentAttribute
					].hasOwnProperty('min') &&
					this.styles[this.currentSelector].attributes[
						this.currentAttribute
					].min >
						this.styles[this.currentSelector].attributes[
							this.currentAttribute
						].value
				) {
					this.styles[this.currentSelector].attributes[
						this.currentAttribute
					].value = this.styles[this.currentSelector].attributes[
						this.currentAttribute
					].min
				}
			}

			// Button clicks
			if (!this.oldButtons.length) {
				this.oldButtons = localGP.buttons.map(x => x.pressed)
			} else {
				localGP.buttons.forEach((button, buttonIndex) => {
					if (
						button.pressed != this.oldButtons[buttonIndex] &&
						button.pressed
					) {
						;[
							() => {
								// A - 0
							},
							() => {
								// B - 1
							},
							() => {
								// X - 2
							},
							() => {
								// Y - 3
							},
							() => {
								// L1 - 4
								if (
									this.styles[this.currentSelector]
										.attributes[this.currentAttribute]
										.type == 'select'
								) {
									this.styles[
										this.currentSelector
									].attributes[
										this.currentAttribute
									].value = this.askHigher(
										this.styles[this.currentSelector]
											.attributes[this.currentAttribute]
											.value,
										this.styles[this.currentSelector]
											.attributes[this.currentAttribute]
											.options
									)
								}
							},
							() => {
								// R1 - 5
								if (
									this.styles[this.currentSelector]
										.attributes[this.currentAttribute]
										.type == 'select'
								) {
									this.styles[
										this.currentSelector
									].attributes[
										this.currentAttribute
									].value = this.askLower(
										this.styles[this.currentSelector]
											.attributes[this.currentAttribute]
											.value,
										this.styles[this.currentSelector]
											.attributes[this.currentAttribute]
											.options
									)
								}
							},
							() => {
								// L2 - 6
							},
							() => {
								// R2 - 7
							},
							() => {
								// Back - 8
							},
							() => {
								// Start - 9
							},
							() => {
								// LS - 10
							},
							() => {
								// RS - 11
							},
							() => {
								// Up - 12
								this.currentAttribute = this.askLower(
									this.currentAttribute,
									this.styles[this.currentSelector].attributes
								)
							},
							() => {
								// Down - 13
								this.currentAttribute = this.askHigher(
									this.currentAttribute,
									this.styles[this.currentSelector].attributes
								)
							},
							() => {
								// Left - 14
								this.currentSelector = this.askLower(
									this.currentSelector,
									this.styles
								)
								this.maxAttribute()
							},
							() => {
								// Right - 16
								this.currentSelector = this.askHigher(
									this.currentSelector,
									this.styles
								)
								this.maxAttribute()
							}
						][buttonIndex]()
					}
				})
			}
			this.oldButtons = localGP.buttons.map(x => x.pressed)
			requestAnimationFrame(this.loop)
		},
		askHigher(current, list) {
			return current >= list.length - 1 ? 0 : current + 1
		},
		askLower(current, list) {
			return current <= 0 ? list.length - 1 : current - 1
		},
		maxAttribute() {
			if (
				this.styles[this.currentSelector].attributes.length - 1 <
				this.currentAttribute
			) {
				this.currentAttribute =
					this.styles[this.currentSelector].attributes.length - 1
			}
		},
		nonSelectable(attribute) {
			return ['hue', 'saturation', 'lightness', 'alpha'].includes(
				attribute.name
			)
		},
		rumble(duration = 400, magnitue = 0.5) {
			this.gamepad.vibration.playEffect('dual-rumble', {
				startDelay: 0,
				duration: duration,
				weakMagnitude: magnitue,
				strongMagnitude: magnitue
			})
		}
	},
	computed: {
		colorOffsets() {
			// return this.styles
			// 	.filter(style => style.type == 'color')
			// 	.map(color => {
			// 		return color.attributes.map(attr => {
			// 			return {
			// 				// attr.name: attr.value + attr.
			// 			}
			// 		})
			// 	})
		},
		stylesHtml() {
			return `<style>${this.styles
				.map(selector => {
					if (selector.type == 'color') {
						return `:root {
	--${selector.selector}: hsl(${selector.attributes[0].value}, ${
							selector.attributes[1].value
						}%, ${selector.attributes[2].value}%, ${
							selector.attributes[3].value
						});\n}`
					}
					return `${selector.selector} {\n${selector.attributes
						.map(attribute => {
							if (attribute.type == 'float') {
								return `\t${attribute.name}: ${
									attribute.value
								}${attribute.suffix};`
							} else if (attribute.type == 'select') {
								return `\t${attribute.name}: ${
									attribute.options[attribute.value]
								};`
							}
						})
						.join('\n')}\n}`
				})
				.join('\n')}</style>`
		}
	}
})
