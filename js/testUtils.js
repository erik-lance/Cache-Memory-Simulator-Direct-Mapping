// Wait for the page to finish loading before running the code
window.onload = function() {
    // Get all text fields on the page
    const block_size_field = $("#blockSize");

    const main_memory_size_field      = $("#mmSizeValue");
    const main_memory_size_unit_field = $("#mmSizeDropdown");

    const cache_memory_size_field      = $("#cmSizeValue");
    const cache_memory_size_unit_field = $("#cmSizeDropdown");

    const cache_access_time_field       = $("#cAccessTime");
    const main_memory_access_time_field = $("#mmAccessTime");

    const input_sequence_field      = $("#inputSeqValues");
    const input_sequence_unit_field = $("#inputSeqDropdown");

    const passes_field = $("#pass");

    // Change test to probset number
    let test = 1

    switch (test) {
        case 1:
            probset1();
            break;
        case 5:
            probSet5();
            break;
        case 6:
            probSet6();
            break;
        default:
            break;
    }

    function probset1() {
        block_size_field.val(128);

        main_memory_size_field.val(2**12);
        main_memory_size_unit_field.val("mmSizeBlocks");

        cache_memory_size_field.val(2**6);
        cache_memory_size_unit_field.val("cmSizeBlocks");

        cache_access_time_field.val(1);
        main_memory_access_time_field.val(10);

        input_sequence_field.val("1000");
        input_sequence_unit_field.val("Blocks");

        passes_field.val(1);
    }

    function probset4() {
        // Note: This is meant to be incomplete. The user should fill in the rest.

        input_sequence_field.val("200,204,208,20C,2F4,2F0,200,204,218,21C,24C,2F4");
        input_sequence_unit_field.val("Hex");
    }

    function probSet5() {
        cache_memory_size_field.val(4);
        cache_memory_size_unit_field.val("cmSizeBlocks");

        block_size_field.val(4);
        cache_access_time_field.val(1);
        main_memory_access_time_field.val(10);

        input_sequence_field.val("1,2,3,4,5,4,6,3");
        input_sequence_unit_field.val("Blocks");

        passes_field.val(1);
    }

    function probSet6() {
        block_size_field.val(2**6);

        main_memory_size_field.val(2**20);
        main_memory_size_unit_field.val("mmSizeWords");

        cache_memory_size_field.val(2**12);
        cache_memory_size_unit_field.val("cmSizeWords");

        cache_access_time_field.val(1);
        main_memory_access_time_field.val(10);

        input_sequence_field.val("0-4351");
        input_sequence_unit_field.val("Range");

        passes_field.val(10);
    }

    console.log("Page loaded")
}

