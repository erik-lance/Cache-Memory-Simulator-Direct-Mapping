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

    probSet5();

    function probSet5() {
        cache_memory_size_field.val(4);
        cache_memory_size_unit_field.val("cmSizeBlocks");

        block_size_field.val(4);
        cache_access_time_field.val(1);
        main_memory_access_time_field.val(10);
    }

    console.log("Page loaded")
}

