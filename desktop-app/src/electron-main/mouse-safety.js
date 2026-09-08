/**
 * Centralized Mouse Safety Coordinator for V.I.S.I.O.N.
 * 
 * Guarantees that simulated mouse buttons are never left pressed when:
 * - Tracking stops or is paused
 * - Camera stream fails or disconnects
 * - Face tracking confidence drops or face is lost
 * - Manual physical mouse takeover is initiated
 * - Electron window blurs, closes, or crashes
 * - Renderer process disconnects or becomes unresponsive
 * - Application quits or unhandled exceptions occur
 */

function createMouseSafetyCoordinator({
	mouseDown = async () => {},
	mouseUp = async () => {},
	emergencyMouseUpSync = null,
	getClickingAllowed = () => true,
	onSafetyRelease = null,
} = {}) {
	const buttonStates = {
		left: false,
		right: false,
		middle: false,
	};

	let clickingAllowedPredicate = getClickingAllowed;

	function setClickingAllowedPredicate(fn) {
		if (typeof fn === 'function') {
			clickingAllowedPredicate = fn;
		}
	}

	function isClickingAllowed() {
		try {
			return Boolean(clickingAllowedPredicate());
		} catch (err) {
			console.error("[MouseSafety] Error in isClickingAllowed predicate:", err);
			return false;
		}
	}

	function normalizeButtonName(button, swapButtons = false) {
		let name = "middle";
		if (button === 0 || button === 'left') {
			name = swapButtons ? "right" : "left";
		} else if (button === 2 || button === 'right') {
			name = swapButtons ? "left" : "right";
		} else if (button === 1 || button === 'middle') {
			name = "middle";
		}
		return name;
	}

	async function setMouseButtonState(button, down, swapButtons = false) {
		const buttonName = normalizeButtonName(button, swapButtons);

		if (down) {
			// CRITICAL SAFETY CHECK: If clicking is disallowed, NEVER press down!
			if (!isClickingAllowed()) {
				return false;
			}
			if (!buttonStates[buttonName]) {
				buttonStates[buttonName] = true;
				try {
					await mouseDown(buttonName);
					return true;
				} catch (err) {
					console.error(`[MouseSafety] Failed to press ${buttonName} down:`, err);
					buttonStates[buttonName] = false;
					return false;
				}
			}
			return false;
		} else {
			// CRITICAL SAFETY RULE: Releasing a button is ALWAYS permitted,
			// even if isClickingAllowed() is false!
			if (buttonStates[buttonName]) {
				buttonStates[buttonName] = false;
				try {
					await mouseUp(buttonName);
					return true;
				} catch (err) {
					console.error(`[MouseSafety] Failed to release ${buttonName}:`, err);
					return false;
				}
			}
			return false;
		}
	}

	async function releaseAllMouseButtons(reason = 'safety-trigger') {
		const releasedButtons = [];
		for (const buttonName of ['left', 'middle', 'right']) {
			if (buttonStates[buttonName]) {
				buttonStates[buttonName] = false;
				releasedButtons.push(buttonName);
				try {
					await mouseUp(buttonName);
				} catch (err) {
					console.error(`[MouseSafety] Error releasing ${buttonName} on ${reason}:`, err);
				}
			}
		}

		if (releasedButtons.length > 0) {
			console.warn(`[MouseSafety] Fail-safe released buttons [${releasedButtons.join(', ')}] due to: ${reason}`);
			if (typeof onSafetyRelease === 'function') {
				try {
					onSafetyRelease(releasedButtons, reason);
				} catch (_err) {
					// Ignore errors in user callback during fail-safe release
				}
			}
		}

		return releasedButtons;
	}

	function emergencyReleaseSync(reason = 'process-emergency') {
		const released = [];
		for (const buttonName of ['left', 'middle', 'right']) {
			if (buttonStates[buttonName]) {
				buttonStates[buttonName] = false;
				released.push(buttonName);
				if (typeof emergencyMouseUpSync === 'function') {
					try {
						emergencyMouseUpSync(buttonName);
					} catch (_err) {
						// Ignore native errors during emergency release
					}
				}
			}
		}
		if (released.length > 0) {
			console.warn(`[MouseSafety] Emergency synchronous release executed for [${released.join(', ')}] due to: ${reason}`);
		}
		return released;
	}

	function isAnyButtonDown() {
		return buttonStates.left || buttonStates.right || buttonStates.middle;
	}

	function getButtonStates() {
		return { ...buttonStates };
	}

	function attachWindowSafetyListeners(win, windowName = 'window') {
		if (!win || typeof win.on !== 'function') return;

		win.on('blur', () => {
			releaseAllMouseButtons(`${windowName}-blur`);
		});

		win.on('close', () => {
			releaseAllMouseButtons(`${windowName}-close`);
		});

		win.on('closed', () => {
			releaseAllMouseButtons(`${windowName}-closed`);
		});

		if (win.webContents && typeof win.webContents.on === 'function') {
			win.webContents.on('render-process-gone', (_event, details) => {
				releaseAllMouseButtons(`${windowName}-render-process-gone (${details?.reason || 'unknown'})`);
			});

			win.webContents.on('unresponsive', () => {
				releaseAllMouseButtons(`${windowName}-unresponsive`);
			});

			win.webContents.on('destroyed', () => {
				releaseAllMouseButtons(`${windowName}-webContents-destroyed`);
			});
		}
	}

	function attachAppSafetyListeners(appInstance) {
		if (!appInstance || typeof appInstance.on !== 'function') return;

		appInstance.on('before-quit', () => {
			releaseAllMouseButtons('app-before-quit');
		});

		appInstance.on('will-quit', () => {
			releaseAllMouseButtons('app-will-quit');
		});
	}

	function attachProcessSafetyListeners(processInstance) {
		if (!processInstance || typeof processInstance.on !== 'function') return;

		processInstance.on('exit', () => {
			emergencyReleaseSync('process-exit');
		});

		processInstance.on('uncaughtException', (err) => {
			console.error('[MouseSafety] Uncaught Exception:', err);
			emergencyReleaseSync('uncaught-exception');
		});

		processInstance.on('unhandledRejection', (reason) => {
			console.error('[MouseSafety] Unhandled Rejection:', reason);
			releaseAllMouseButtons('unhandled-rejection');
		});
	}

	return {
		setMouseButtonState,
		releaseAllMouseButtons,
		emergencyReleaseSync,
		isAnyButtonDown,
		getButtonStates,
		isClickingAllowed,
		setClickingAllowedPredicate,
		attachWindowSafetyListeners,
		attachAppSafetyListeners,
		attachProcessSafetyListeners,
	};
}

module.exports = {
	createMouseSafetyCoordinator,
};
