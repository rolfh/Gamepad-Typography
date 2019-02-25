if (button.pressed != oldButtons[buttonIndex]) {
	return {
		new: true,
		click: button.pressed != oldButtons[buttonIndex],
		id: buttonIndex,
		isDown: button.pressed
	}
} else {
	return {
		new: false
	}
}
// .filter(button => button.new)
