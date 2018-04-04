var output = document.getElementById("json-output");
for (let e of document.querySelectorAll("#theme-options input")) {
    e.addEventListener("input", function (event) {
        updateOutput(event.target);
    });
}
M.Tabs.init(document.querySelector(".tabs"));

const lausdImageUrl = "https://cdn.schoology.com/system/files/imagecache/node_themes/sites/all/themes/schoology_theme/node_themes/424392825/BrandingUpdateLAUSD_59d2b7fc44916.png";

var themeName = document.getElementById("theme-name");
var themeHue = document.getElementById("theme-hue");
var themePrimaryColor = document.getElementById("theme-primary-color");
var themeSecondaryColor = document.getElementById("theme-secondary-color");
var themeBackgroundColor = document.getElementById("theme-background-color");
var themeBorderColor = document.getElementById("theme-border-color");
var themeSchoologyLogo = document.getElementById("theme-schoology-logo");
var themeLAUSDLogo = document.getElementById("theme-lausd-logo");
var themeCustomLogo = document.getElementById("theme-custom-logo");
var themeLogo = document.getElementById("theme-logo");
var themeCursor = document.getElementById("theme-cursor");
var themeColorHue = document.getElementById("theme-color-hue");
var themeColorCustom = document.getElementById("theme-color-custom");
var themeColorCustomWrapper = document.getElementById("theme-color-custom-wrapper");
var themeHueWrapper = document.getElementById("theme-hue-wrapper");
var themeLogoWrapper = document.getElementById("theme-logo-wrapper");

var previewNavbar = document.getElementById("preview-navbar");
var previewLogo = document.getElementById("preview-logo");

let warnings = [];
let errors = [];
let theme = {};

function updateOutput(target) {
    warnings = [];
    errors = [];
    let hue = undefined;
    theme = {
        name: themeName.value || undefined,
    }

    if (!theme.name) {
        errors.push("Theme must have a name")
    }

    if (themeColorHue.checked) {
        if ((hue = Number.parseFloat(themeHue.value)) || hue === 0) {
            theme.hue = hue;
            setCSSVariable("color-hue", hue);
        } else {
            setCSSVariable("color-hue", 210);
        }
    }

    switch (target) {
        case themeSchoologyLogo:
            theme.logo = "schoology";
            themeLogo.setAttribute("disabled", "");
            setCSSVariable("background-url", "none");
            previewLogo.classList.add("hide-background-image");
            previewLogo.classList.remove("custom-background-image");
            themeLogoWrapper.classList.add("hidden");
            break;
        case themeLAUSDLogo:
            theme.logo = "lausd";
            themeLogo.setAttribute("disabled", "");
            setCSSVariable("background-url", `url(${lausdImageUrl})`);
            previewLogo.classList.remove("hide-background-image");
            previewLogo.classList.add("custom-background-image");
            themeLogoWrapper.classList.add("hidden");
            break;
        case themeCustomLogo:
            themeLogo.removeAttribute("disabled");
            themeLogoWrapper.classList.remove("hidden");
            break;
        case themeColorHue:
            themeHue.removeAttribute("disabled");
            themePrimaryColor.setAttribute("disabled", "");
            themeSecondaryColor.setAttribute("disabled", "");
            themeBorderColor.setAttribute("disabled", "");
            themeBackgroundColor.setAttribute("disabled", "");
            themeColorCustomWrapper.classList.add("hidden");
            themeHueWrapper.classList.remove("hidden");
            break;
        case themeColorCustom:
            themeHue.setAttribute("disabled", "");
            themePrimaryColor.removeAttribute("disabled");
            themeSecondaryColor.removeAttribute("disabled");
            themeBorderColor.removeAttribute("disabled");
            themeBackgroundColor.removeAttribute("disabled");
            themeColorCustomWrapper.classList.remove("hidden");
            themeHueWrapper.classList.add("hidden");
            break;
    }

    if (themeCustomLogo.checked && themeLogo.value) {
        checkImage(themeLogo.value, (x) => {
            if (x.target.width != 160 || x.target.height != 36) {
                warnings.push("Logo image is not the recommended size of 160x36");
            }
            theme.logo = themeLogo.value;
            setCSSVariable("background-url", `url(${theme.logo})`);
            previewLogo.classList.remove("hide-background-image");
            previewLogo.classList.add("custom-background-image");
            updatePreview();
        }, (x) => {
            errors.push("Logo URL is invalid");
            setCSSVariable("background-url", "none");
            previewLogo.classList.add("hide-background-image");
            previewLogo.classList.remove("custom-background-image");
            updatePreview();
        });
    } else if (themeCustomLogo.checked) {
        errors.push("No logo URL specified");
    }


    if (themeCursor.value) {
        checkImage(themeCursor.value, (x) => {
            if(x.target.width > 128 || x.target.height > 128) {
                warnings.push("Cursor images must be smaller than 128x128 to appear");
            }
            theme.cursor = themeCursor.value;
            setCSSVariable("cursor", `url(${themeCursor.value}), auto`);
            updatePreview();
        }, (x) => {
            errors.push("Cursor URL is invalid");
            setCSSVariable("cursor", "auto");
            updatePreview();
        });
    }

    if (theme.hue && (theme.hue < 0 || theme.hue > 359 || theme.hue != Math.floor(theme.hue))) {
        warnings.push("Hue should be a positive integer between 0 and 359");
    }

    if (themeColorCustom.checked) {
        let colors = [
            themePrimaryColor.value || undefined,
            themeBackgroundColor.value || undefined,
            themeSecondaryColor.value || undefined,
            themeBorderColor.value || undefined
        ];

        let colorMappings = ["primary-color", "primary-light", "primary-dark", "primary-very-dark"];

        let valid = true;
        let validCount = 0;
        for (let i = 0; i < colors.length; i++) {
            let cc = validateColor(colors[i]);
            if (!cc) {
                valid = false;
                document.documentElement.style.removeProperty(`--${colorMappings[i]}`);
            } else {
                validCount++;
                setCSSVariable(colorMappings[i], cc);
                colors[i] == cc;
            }
        }

        if (valid && validCount > 0) {
            theme.colors = colors;
        } else if (colors.filter(x => x).length > 0) {
            errors.push("One or more of your specified colors is invalid");
        } else if (validCount > 0) {
            warnings.push("All four colors must be specified")
        }

        if (theme.colors && theme.hue) {
            warnings.push("Your specified hue value will be overridden by your other color choices");
        }
    }

    updatePreview();
}

function updatePreview() {
    output.value = JSON.stringify(theme, null, "\t");
    let warningCard = document.getElementById("warning-card");
    if (warnings.length > 0) {
        warningCard.style.display = "block";
        document.getElementById("warning-content").innerHTML = warnings.join("<br/>");
    }
    else {
        warningCard.style.display = "none";
    }
    let errorCard = document.getElementById("error-card");
    if (errors.length > 0) {
        errorCard.style.display = "block";
        document.getElementById("error-content").innerHTML = errors.join("<br/>");
    }
    else {
        errorCard.style.display = "none";
    }
    M.updateTextFields();
    M.textareaAutoResize(output);
}

function validateColor(c) {
    var ele = document.createElement("div");
    ele.style.color = c;
    return ele.style.color.split(/\s+/).join('').toLowerCase();
}

function checkImage(imageSrc, validCallback, invalidCallback) {
    var img = new Image();
    img.onload = validCallback;
    img.onerror = invalidCallback;
    img.src = imageSrc;
}

function setCSSVariable(name, val) {
    document.documentElement.style.setProperty(`--${name}`, val);
}

updateOutput(document.rootElement);