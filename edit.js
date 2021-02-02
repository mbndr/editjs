EditJS = (function() {    
    const MODE_TEXT = 0;
    const MODE_EDIT = 1;
    const CLASSNAME = "ejs";

    function EditJS(opt) {
        opt = opt || {};
        this.activeIds = opt.activeIds || [];
        this.onChange = opt.onChange || function(id, value) {};

        this.fields = {}; // id -> object
        this.register();

        for (let i = 0; i < this.activeIds.length; i++) {
            const id = this.activeIds[i];
            const field = this.fields[this.activeIds[i]];
            if (!field) continue;

            this.fields[id].mode = MODE_EDIT;
            this.createElement(id);
        }
    }

    // register DOM elements as editjs fields
    EditJS.prototype.register = function() {
        const elements = document.getElementsByClassName(CLASSNAME);
        
        for (let i = 0; i < elements.length; i++) {
            const id = elements[i].id;
            if (!id) {
                console.log("skipping element (no id)");
                continue;
            }

            this.fields[id] = {
                wrapper: elements[i],
                mode: MODE_TEXT,
                value: elements[i].innerText
            };

            this.createElement(id);
        }
    };

    // register autoresize
    function registerTextareaResize(ta) {
        function autoResize(ta) {
            ta.style.height = ta.scrollHeight + "px";
        }

        ta.addEventListener("input", function() {
            autoResize(ta);
        });
        autoResize(ta);
    }

    function getEditWrapper(content) {
        let wrapper = document.createElement("div");
        wrapper.className = "edit-wrapper";
        
        let button = document.createElement("button");
        button.className = "save";
        button.innerHTML = "&#x2713;";

        let ta = document.createElement("textarea");
        ta.value = content;

        wrapper.append(ta, button);
        return wrapper;
    }

    function getEditable(content) {
        let div = document.createElement("div");
        div.className = "editable";
        div.innerText = content;
        
        return div;
    }

    // creates the html element of a specific mode, adds it to the dom and adds event listeners
    EditJS.prototype.createElement = function(id) {
        let element = null;
        let field = this.fields[id]; // readonly

        if (field.mode === MODE_EDIT) {
            element = getEditWrapper(field.value);
            // register save shortcut        
            element.querySelector("textarea").addEventListener("keydown", function(e) {
                if (e.ctrlKey && e.key === "s") {
                    e.preventDefault();
                    element.querySelector("button.save").click();
                }
            })
        } else { // default: MODE_TEXT
            element = getEditable(field.value);
        }

        if (element !== null) {
            while (field.wrapper.hasChildNodes()) {
                field.wrapper.removeChild(field.wrapper.lastChild);
            }
            field.wrapper.appendChild(element);

            this.setEventListener(id);
        }
    };

    // set event listener on field
    EditJS.prototype.setEventListener = function(id) {
        let field = this.fields[id];
        let self = this;

        if (field.mode === MODE_TEXT) {
            field.wrapper.querySelector("div.editable").addEventListener("click", function() {
                self.fields[id].mode = MODE_EDIT;
                self.createElement(id);
                const ta = field.wrapper.querySelector("textarea");
                ta.focus();
                registerTextareaResize(ta);
            });
        }

        else if (field.mode === MODE_EDIT) {
            const ta = field.wrapper.querySelector("textarea");

            field.wrapper.querySelector("button.save").addEventListener("click", function() {
                self.fields[id].mode = MODE_TEXT;
                self.fields[id].value = ta.value;
                self.onChange(id, self.fields[id].value);
                self.createElement(id);
            });
        }
    };

    EditJS.prototype.setValue = function(id, value) {
        if (this.fields[id]) {
            this.fields[id].value = value;
            this.createElement(id);            
        }
    };

    EditJS.prototype.setActive = function(id, active) {
        if (this.fields[id]) {
            this.fields[id].mode = active === true ? MODE_EDIT : MODE_TEXT;
            this.createElement(id);                
        }
    };

    EditJS.prototype.getValue = function(id) {
        const field = this.fields[id];
        return field.value || undefined;
    };

    EditJS.prototype.getValues = function() {
        let ret = {};

        const ids = Object.keys(this.fields);
        for (let i = 0; i < ids.length; i++) {
            ret[ids[i]] = this.fields[ids[i]].value;
        }

        return ret;
    };

    return EditJS;
})();