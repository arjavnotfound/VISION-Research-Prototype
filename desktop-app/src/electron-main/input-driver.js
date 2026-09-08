let serenade = null;
try {
	serenade = require('serenade-driver');
} catch (_err) {
	// serenade-driver native addon not compiled; using koffi Win32 driver
}

let koffiUser32 = null;
if (process.platform === 'win32') {
	try {
		const koffi = require('koffi');
		const user32 = koffi.load('user32.dll');
		const POINT = koffi.struct('POINT', { x: 'long', y: 'long' });
		const GetCursorPos = user32.func('bool GetCursorPos(_Out_ POINT* lpPoint)');
		const SetCursorPos = user32.func('bool SetCursorPos(int x, int y)');
		const mouse_event = user32.func('void mouse_event(uint32 dwFlags, uint32 dx, uint32 dy, uint32 dwData, uintptr dwExtraInfo)');
		const keybd_event = user32.func('void keybd_event(uint8 bVk, uint8 bScan, uint32 dwFlags, uintptr dwExtraInfo)');

		koffiUser32 = {
			POINT,
			GetCursorPos,
			SetCursorPos,
			mouse_event,
			keybd_event,
		};
	} catch (e) {
		console.warn('Could not load koffi user32 bindings:', e);
	}
}

const MOUSEEVENTF_LEFTDOWN = 0x0002;
const MOUSEEVENTF_LEFTUP = 0x0004;
const MOUSEEVENTF_RIGHTDOWN = 0x0008;
const MOUSEEVENTF_RIGHTUP = 0x0010;
const MOUSEEVENTF_MIDDLEDOWN = 0x0020;
const MOUSEEVENTF_MIDDLEUP = 0x0040;

const KEYEVENTF_KEYUP = 0x0002;
const VK_MAP = {
	up: 0x26,
	down: 0x28,
	left: 0x25,
	right: 0x27,
	return: 0x0d,
	enter: 0x0d,
	escape: 0x1b,
	space: 0x20,
	tab: 0x09,
	backspace: 0x08,
	delete: 0x2e,
	home: 0x24,
	end: 0x23,
	pageup: 0x21,
	pagedown: 0x22,
};

async function getMouseLocation() {
	if (serenade && typeof serenade.getMouseLocation === 'function') {
		try {
			return await serenade.getMouseLocation();
		} catch (_e) {
			// Fall through to koffi / electron screen
		}
	}
	if (koffiUser32) {
		try {
			const pt = {};
			koffiUser32.GetCursorPos(pt);
			return { x: pt.x || 0, y: pt.y || 0 };
		} catch (_e) {
			// Fall through to electron screen
		}
	}
	try {
		const { screen } = require('electron');
		if (screen && typeof screen.getCursorScreenPoint === 'function') {
			return screen.getCursorScreenPoint();
		}
	} catch (_e) {
		// Non-fatal fallback
	}
	return { x: 0, y: 0 };
}

async function setMouseLocation(x, y) {
	if (serenade && typeof serenade.setMouseLocation === 'function') {
		try {
			return await serenade.setMouseLocation(x, y);
		} catch (_e) {
			// Fall through to koffi
		}
	}
	if (koffiUser32) {
		try {
			koffiUser32.SetCursorPos(Math.round(x), Math.round(y));
		} catch (err) {
			console.error('Failed to set cursor pos via koffi:', err);
		}
	}
}

async function mouseDown(button = 'left') {
	if (serenade && typeof serenade.mouseDown === 'function') {
		try {
			return await serenade.mouseDown(button);
		} catch (_e) {
			// Fall through to koffi
		}
	}
	if (koffiUser32) {
		try {
			const flag = button === 'right' ? MOUSEEVENTF_RIGHTDOWN : (button === 'middle' ? MOUSEEVENTF_MIDDLEDOWN : MOUSEEVENTF_LEFTDOWN);
			koffiUser32.mouse_event(flag, 0, 0, 0, 0);
		} catch (err) {
			console.error('Failed to send mouseDown via koffi:', err);
		}
	}
}

async function mouseUp(button = 'left') {
	if (serenade && typeof serenade.mouseUp === 'function') {
		try {
			return await serenade.mouseUp(button);
		} catch (_e) {
			// Fall through to koffi
		}
	}
	if (koffiUser32) {
		try {
			const flag = button === 'right' ? MOUSEEVENTF_RIGHTUP : (button === 'middle' ? MOUSEEVENTF_MIDDLEUP : MOUSEEVENTF_LEFTUP);
			koffiUser32.mouse_event(flag, 0, 0, 0, 0);
		} catch (err) {
			console.error('Failed to send mouseUp via koffi:', err);
		}
	}
}

function mouseUpSync(button = 'left') {
	if (koffiUser32) {
		try {
			const flag = button === 'right' ? MOUSEEVENTF_RIGHTUP : (button === 'middle' ? MOUSEEVENTF_MIDDLEUP : MOUSEEVENTF_LEFTUP);
			koffiUser32.mouse_event(flag, 0, 0, 0, 0);
		} catch (err) {
			console.error('Failed to dispatch mouseUpSync:', err);
		}
	}
}

async function click(button = 'left', count = 1) {
	if (serenade && typeof serenade.click === 'function') {
		try {
			return await serenade.click(button, count);
		} catch (_e) {
			// Fall through
		}
	}
	for (let i = 0; i < count; i++) {
		await mouseDown(button);
		await mouseUp(button);
	}
}

async function pressKey(key, modifiers = [], count = 1) {
	if (serenade && typeof serenade.pressKey === 'function') {
		try {
			return await serenade.pressKey(key, modifiers, count);
		} catch (_e) {
			// Fall through to koffi
		}
	}
	if (koffiUser32) {
		const vk = VK_MAP[key.toLowerCase()] || 0;
		if (vk) {
			try {
				for (let i = 0; i < count; i++) {
					koffiUser32.keybd_event(vk, 0, 0, 0);
					koffiUser32.keybd_event(vk, 0, KEYEVENTF_KEYUP, 0);
				}
			} catch (err) {
				console.error('Failed to pressKey via koffi:', err);
			}
		}
	}
}

module.exports = {
	getMouseLocation,
	setMouseLocation,
	mouseDown,
	mouseUp,
	mouseUpSync,
	click,
	pressKey,
};
