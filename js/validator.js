var successTimeout, errorTimeout,  tempFields = [];

function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
}

/**
 * Shows the error message and highlights all the
 * inputs in elements array for 5 seconds.
 * @param  {element} error
 * @param  {string} message
 * @param  {element[]} elements
 */
function showError(error, message, elements) {
    clearTimeout(errorTimeout);
    for (const oldInput of tempFields) {
        oldInput.classList.remove("error");
    }
    tempFields = elements.slice();

    if (error) {
        error.innerHTML = message;
        error.classList.add("active");
    }
    for (const input of elements) {
        input.classList.add("error");
    }
    errorTimeout = setTimeout(() => {
        if (error) error.classList.remove("active");
        for (const input of elements) {
            input.classList.remove("error");
        }
    }, 5000);
}

/**
 * Clears content/innerHTML of the given element
 * @param  {element} element
 */
function clear(element) {
    element.innerHTML = "";
}
