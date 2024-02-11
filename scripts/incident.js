const custom_css = true;

const form_variables = {};

var options;
chrome.storage.sync.get().then((options) => {
    if (options.alt_layout_enabled) {
        //loadcssfile("css\incident_alt_layout.css")
    }
});

function loadcssfile(filename){
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
}

const getValue = (prop) => {
    const id = "incident." + prop;
    const node = document.getElementById(id);
    if (node && node.tagName === "INPUT"){
        return node.value;
    }
    return null;
}

const getDisplayValue = (prop) => {
    let id = "sys_display.incident." + prop;
    let node = document.getElementById(id);
    if (node && node.tagName === "INPUT"){
        return node.value;
    }
    id = "incident." + prop;
    node = document.getElementById(id);
    if (node && node.tagName === "INPUT"){
        return node.value;
    }
    id = "incident." + prop;
    node = document.getElementById(id);
    if (node && node.tagName === "SELECT"){
        return node[node.selectedIndex].innerHTML;
    }
    return null;
}

const get_form_variables = () => {
    form_variables.incident_number = getValue("number");
    form_variables.caller_id = getValue("caller_id");
    form_variables.caller_name = getDisplayValue("caller_id");
    form_variables.affected_user_id = getValue("u_affected_user");
    form_variables.affected_user_name = getDisplayValue("u_affected_user");
    form_variables.phone_number = getDisplayValue("u_phone");
    form_variables.company_id = getValue("company");
    form_variables.company_name = getDisplayValue("company");
    form_variables.priority = getDisplayValue("priority");
    form_variables.assignment_group_id = getValue("assignment_group");
    form_variables.assignment_group_name = getDisplayValue("assignment_group");
    form_variables.assigned_to_id = getValue("assigned_to");
    form_variables.assigned_to_name = getDisplayValue("assigned_to");
    form_variables.state = getDisplayValue("state");
    console.log(form_variables);
}

async function create_notes () {
    const company_id = form_variables.company_id;
    let settings_object = await chrome.storage.sync.get(["saved_notes"]);
    settings_object = settings_object["saved_notes"];
    console.log(settings_object);
    let company_object;
    if (settings_object.hasOwnProperty(company_id)) {
        console.log("Loaded saved");
        company_object = settings_object[company_id];
    } else {
        company_object = {name: form_variables.company_name, notes: (form_variables.company_name + " notes")};
        console.log("Created new");
    }
    console.log(company_object);
    save_notes(company_object);
    
    function save_notes(obj) {
        chrome.storage.sync.get(["saved_notes"]).then((settings_object) => {
            settings_object = settings_object["saved_notes"];
            settings_object[company_id] = obj;
            chrome.storage.sync.set({saved_notes: settings_object});
            console.log("saved: ", saved);
        });
    }
    
    // check if already exist
    /*
    if (Object.entries(company_object).length === 0){
        console.log("no existing objecy found, creating blank");
        save_notes({name: form_variables.company_name, notes: (form_variables.company_name + " notes")});
        company_object = await chrome.storage.sync.get(["saved_notes"])[company_id]
    }*/
    
    const notes_html = `
        <div id="toggle_notes_lock" class="btn btn-default btn-ref" style="float: right"><span id="toggle_notes_img" class="icon icon-locked"></span></div>
        <textarea id="custom_notes_text" style="min-width: calc(100% - 32px - var(--now-global-space--md,10px)); max-width: calc(100% - 32px - var(--now-global-space--md,10px)); margin-right: var(--now-global-space--md,10px);" class="personalNotesText form-control hidden">${company_object.notes}</textarea>
        <div id="custom_notes_div"></div>
        
    `;

    const parent_node = document.getElementById("element.incident.description");
    const notes_node = document.createElement("div");
    notes_node.id = "custom_notes";
    notes_node.classList.add("personalNotes", "notification-info", "notification");
    notes_node.style = "padding-inline-end: var(--now-global-space--md,10px);";
    notes_node.innerHTML = notes_html;
    parent_node.appendChild(notes_node);
    document.getElementById("custom_notes_div").innerHTML = company_object.notes;

    // save to storage and update display div every time lock button is pressed
    document.getElementById("toggle_notes_lock").onclick = (e) => {
        e.preventDefault();
        
		const text_node = document.querySelector("#custom_notes_text");
		text_node.classList.toggle("hidden");
        
		const div_node = document.querySelector("#custom_notes_div");
		div_node.classList.toggle("hidden");
        
        const img = document.querySelector("#toggle_notes_img");
		img.classList.toggle("icon-locked");
		img.classList.toggle("icon-unlocked");
        const text_content = document.getElementById("custom_notes_text").value;
        console.log(text_content);
        save_notes({name: form_variables.company_name, notes: text_content});
        document.getElementById("custom_notes_div").innerHTML = text_content;
	};
}

// automates basic resolve actions
async function on_click_resolve_button(){
    let resolve_tab = document.querySelector("div#tabs2_section > span:nth-child(3) > span:nth-child(1) > span:nth-child(2)");
	resolve_tab.click();
	document.querySelector('[tab_caption_raw="Closure Information"]').scrollIntoView(true);

	var close_field = document.getElementById("incident.close_notes");
	close_field.innerHTML = close_field.innerHTML.concat(form_variables.affected_user_name.split(" ")[0] + " ");
}

// improve the resolve button to switch to close notes tab and scroll into view
awaitSelector("#resolve_incident").then(
    (nodes) => {
        nodes[0].addEventListener("click", on_click_resolve_button);
    }
);

// Make the form fields on the left column "sticky" so that they don't scroll off the page
if (custom_css) {
    awaitSelector("head").then(
        (node) => {
            let path = chrome.runtime.getURL('css/incident_alt_layout.css');
            console.log(node);
            let csselem = document.createElement('style');
			document.head.appendChild(csselem);
			console.log(csselem);
            csselem.innerHTML = "text";
            /*
            fetch(path).then(function(response) {
                response.text().then(function(text) {
                    csselem.innerHTML = text;
                });
            });*/
        }
    );
    
   //chrome.scripting.insertCSS({target: {tabId: tab.id}, files:['css/incident_alt_layout.css']});
    awaitSelector(".section_header_content_no_scroll.touch_scroll.overflow_x_hidden-hotfix").then(
        (nodes) => {
            nodes[0].addEventListener("scroll", async (e) => {
                const r = document.querySelector('body > div > form > span > span:not(.sn-stream-section) > div.section-content.with-overflow > div:nth-child(2)');
                let x = "translateY(" + e.target.scrollTop + "px)";
                r.style.setProperty("transform", x);
                r.previousSibling.style.setProperty("transform", x);
                //console.log(x);
            }, { passive: true });
        }
    );
}

// make messages toggleable with (i) button
watchAwaitSelector(".outputmsg", 
    (nodes) => {
        console.log(nodes);
        while (nodes.length){
            const node = nodes.pop();
            console.log(node);
            node.firstElementChild.addEventListener("click", (e) => {
                if (e.target.classList.contains("icon-info")) {
                    e.target.nextSibling.classList.toggle("hidden");
                }
            });
            node.lastElementChild.classList.add("hidden");
        }
    }
);

// hide/remove field messages by clicking on them
watchAwaitSelector(".fieldmsg-container",
    (nodes) => {
        while (nodes.length){
            const node = nodes.pop();
            node.addEventListener("click", (e) => {
                node.classList.add("hidden");
            });
        }
    }
);

// copy plaintext INC number to clipboard
function inc_number_to_clipboard(event) {
    navigator.clipboard.writeText(form_variables.incident_number);
	const el = document.querySelector(".navbar-right");
	el.classList.add("icon-clipboard");
	setTimeout(() => {el.classList.remove("icon-clipboard");}, 500);
	event.target.blur();
}

// add a button to the header to copy INC number to clipboard
function add_header_inc_button() {
    const btn = document.createElement("button");
    btn.classList.add("inc_copy_button", "btn", "btn-default");
    const header = document.querySelector("nav.navbar.navbar-default.section_zero > div.container-fluid");
    header.appendChild(btn);
    header.insertBefore(btn, btn.previousSibling);
    btn.addEventListener("click", inc_number_to_clipboard);
    const inner = document.createElement("span");
    inner.innerHTML = form_variables.incident_number;
    btn.appendChild(inner);
}

// add keyboard shortcuts to save (ctrl+S) and resovle (ctrl+D)
document.onkeydown = function(e) {
    if(e.key === 's' && e.ctrlKey){
        e.preventDefault();
        document.querySelector("#sysverb_update_and_stay").click();
    }else if(e.key === 'd' && e.ctrlKey){
        e.preventDefault();
        document.querySelector("#resolve_incident").click();
    }
};

function fix_work_notes_sizing() {
    const node = document.getElementById("activity-stream-work_notes-textarea");
    const text_area_fn = async (e) => {e.target.style.height = "0px"; e.target.style.height = e.target.scrollHeight + 8 + "px";}
    node.addEventListener("change", text_area_fn);
    node.addEventListener("keydown", text_area_fn);
    node.addEventListener("click", text_area_fn);
    setTimeout(() => {node.click();}, 1000);
}

function add_permalink_button() {
    add_header_button("Permalink",
        (event) =>{
            event.preventDefault();
            
            if (!document.getElementById("HTMLpermurl")){
                let permurl = window.location;
                permurl = permurl.protocol + "//" + permurl.hostname + "/incident.do?sys_id=" + new URLSearchParams(permurl.search).get("sys_id");
                let link_html = `<a id="HTMLpermurl" href=${permurl}>${form_variables.incident_number}</a>`
                const node = document.createElement("div");
                node.classList.add("hidden")
                event.target.appendChild(node);
                node.innerHTML = link_html;
            }
            
            function copyToClip(str) {
                function listener(e) {
                    e.clipboardData.setData("text/html", str);
                    e.clipboardData.setData("text/plain", str);
                    e.preventDefault();
                }
                document.addEventListener("copy", listener);
                document.execCommand("copy");
                document.removeEventListener("copy", listener);
            };
            
            copyToClip(document.getElementById("HTMLpermurl").outerHTML);
            
            const el = document.querySelector(".navbar-right");
            el.classList.add("icon-clipboard");
            setTimeout(() => {el.classList.remove("icon-clipboard");}, 500);
        }
    )
}

// wait for document to finish loading before running any more scripts
document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        if (document.querySelector("[id='cxs_maximize_results']")) {
            document.querySelector("[id='cxs_maximize_results']").click();
        }
        // initialize all form variables that might need to be referenced
        get_form_variables();
        
        // create custom company notes
        create_notes();

        // add clickable header button to copy INC number to clipboard
        add_header_inc_button();
    
        // fix the work notes field being too small when loading with template text
        fix_work_notes_sizing();

        // add a permalink button
        add_permalink_button();
    }
}
