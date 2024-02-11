var options;

function check_and_save_notes() {
	const textarea = document.getElementById("notes-textarea");
	if (isJsonString(textarea.value)) {
		options.saved_notes = JSON.parse(textarea.value);
	}
}

function isJsonString(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		var modal = new bootstrap.Modal(document.getElementById("invalid-json"));
		modal.show();
		return false;
	}
	return true;
}

function adjustHeight(el) {
	el.style.height =
		el.scrollHeight > el.clientHeight ? el.scrollHeight + 8 + "px" : "60px";
}

async function main() {
	"use strict";

	document.getElementById("save-button").addEventListener("click", (event => {
		save_options();
	}));

	document.getElementById("confirm-delete").addEventListener("click", (event => {
		chrome.storage.sync.clear();
		location.reload();
	}));

	function save_options() {
		check_and_save_notes();
		chrome.storage.sync.set(options);
	}

	options = await chrome.storage.sync.get();
	console.log(JSON.stringify(options));

	const alt_layout_toggle = document.getElementById("alt-layout");
	alt_layout_toggle.checked = options.alt_layout_enabled || false;
	alt_layout_toggle.addEventListener("input", (event) => {
		console.log("checkbox ",event.target.checked);
		event.target.checked != event.target.checked;
		options.alt_layout_enabled = event.target.checked;
		save_options();
	});
		
	const textarea = document.getElementById("notes-textarea");
	textarea.addEventListener("onKeyUp", (event) => {adjustHeight(this)});
	const saved_notes = options.saved_notes || {};
	textarea.innerHTML = JSON.stringify(saved_notes, undefined, 4);
	adjustHeight(textarea);

}
main();