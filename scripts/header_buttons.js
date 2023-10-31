const add_header_button = (lbl, func) => {
    function get_header() {
        return document.querySelector(".navbar_ui_actions");
    }

    const label = lbl || "Default";
    const header = get_header();
    
    const button = document.createElement("div");
    button.classList.add("btn", "btn-default", "action_context", "header", "form_action_button");
    if (label.startsWith("icon-")){
        button.classList.add("btn-icon", label);
    }
    button.onclick = func;
    button.innerHTML = label;
    header.appendChild(button);
}