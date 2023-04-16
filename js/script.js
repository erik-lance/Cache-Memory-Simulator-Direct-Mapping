document.addEventListener('DOMContentLoaded', function () {
    // JavaScript code to handle dynamic row insertion
    document.getElementById('add-row-btn').addEventListener('click', function () {
        var formContainer = document.getElementById('loop-container');
        var row = document.createElement('div');
        row.className = 'row mt-2';
        row.innerHTML = `
            <div class="col-md-6">
                <input type="text" class="form-control range" placeholder="Range Field">
            </div>
            <div class="col-md-4">
                <input type="number" class="form-control loopNumber" placeholder="Loops">
            </div>
        `;
        formContainer.appendChild(row);
    });

    // JavaScript code to handle dynamic row insertion with indentation
    document.getElementById('add-inside-loop-btn').addEventListener('click', function () {
        var formContainer = document.getElementById('loop-container');
        var row = document.createElement('div');
        row.className = 'row mt-2 indent'; // Add 'indent' class for indentation
        row.innerHTML = `
            <div class="col-md-6">
                <input type="text" class="form-contro range" placeholder="Range Field">
            </div>
            <div class="col-md-4">
                <input type="number" class="form-control loopNumber" placeholder="Loops">
            </div>
        `;
        formContainer.appendChild(row);
    });

    // JavaScript code to handle dynamic row deletion
    document.getElementById('delete-row-btn').addEventListener('click', function () {
        var formContainer = document.getElementById('loop-container');
        var rows = formContainer.getElementsByClassName('row');
        if (rows.length > 0) {
            formContainer.removeChild(rows[rows.length - 1]);
        }
    });
});

var fileUrl;
var fileName;

function submit() {
    //clear console log
    console.clear();
    let validInput = true;
    let MappingMode = $('#inputSeqDropdown').val();
    let blockSize;
    let [mmSize, cmSize] = [];
    let [mainAT, cacheAT] = [];

    //get inputSeq and store in input then split into an array by comma
    let input = $('#inputSeqValues').val();
    let inputProcessed;
    let passes;
    let [mDropdown, cDropdown] = [$('#mmSizeDropdown'), $('#cmSizeDropdown')];
    let [mmSelectedOption, cmSelectedOption] = [mDropdown.val(), cDropdown.val()];
    let [mmSizeType, cmSizeType] = [];

    //Process Data
    let [mmBits, blockBits, wordBits] = [];
    let tagBits;
    let missPenalty;
    let inputSequence;
    let [hit, miss] = [0, 0];
    let cache;
    let [averageAccessTime, totalAccessTime] = [];

    fetchValidateData();

    if (validInput == true)
    {
        if (MappingMode == 'Blocks')
        {
            inputProcessed = input.split(',');
        }
        else if (MappingMode == 'Hex')
        {
            inputProcessed = input.split(',');

            //converts the hex values to decimal
            for (let i = 0; i < inputProcessed.length; i++)
            {
                inputProcessed[i] = parseInt(inputProcessed[i], 16);
            }
        }
        else if (MappingMode == 'Range')
        {
            input = input.split('-');
            rangeInputSequence();
        }
        else if (MappingMode == 'Multi-loop')
        {
            inputProcessed = storeLoopValuesToArray();
            console.log(inputProcessed)
        }

        inputSequence = new Array(inputProcessed.length);
        moduloInputSequence(inputProcessed);
        cache = new Array(cmSize);
        initializeCache();
        simulateCache(inputProcessed);
        computeAccessTimes();

        printLogValues();

        //scroll to the output
        document.getElementById("output").classList.remove("d-none");

        const targetElement = document.getElementById('out-div');
        const targetOffsetTop = targetElement.offsetTop;

        window.scrollTo({
            top: targetOffsetTop,
            behavior: 'smooth'});
    }

    //This function assigns the size type of the memory and cache to a letiable
    //This also calculates the number of bits needed for the Main Memory, tag, block, and word
    function fetchValidateData() {
        // For error messages
        const error = this.document.querySelector('.text-error');

        // Fields
        const error_block_size_field = this.document.querySelector('#blockSize');
        const error_mm_size_field = this.document.querySelector('#mmSizeValue');
        const error_cm_size_field = this.document.querySelector('#cmSizeValue');
        const error_cm_access_time_field = this.document.querySelector('#cAccessTime');
        const error_mm_access_time_field = this.document.querySelector('#mmAccessTime');
        const error_input_sequence_field = this.document.querySelector('#inputSeqValues');
        const error_passes_field = this.document.querySelector('#pass');

        const error_mm_size_unit_field = this.document.querySelector('#mmSizeDropdown');
        const error_cm_size_unit_field = this.document.querySelector('#cmSizeDropdown');

        blockSize = $('#blockSize').val();
        [mmSize, cmSize] = [$('#mmSizeValue').val(), $('#cmSizeValue').val()];

        //Converts the Block Size to the number of bits and checks if it is a power of 2
        if (blockSize > 0) {
            wordBits = getBits(blockSize);
        }
        //Error message if the user enters an invalid Block Size: 0 or not a power of 2
        if (blockSize <= 0 || wordBits == -1) {
            showError(error, 'Please enter a valid Block Size', [error_block_size_field]);
            validInput = false;
        }
        mmSizeType = mmSelectedOption;
        //Main Memory is not needed when the mapping mode is Blocks or Range
        if (mmSelectedOption === 'Unit' && !(MappingMode == 'Blocks' || MappingMode == 'Range')) {
            showError(error, 'Please choose a size type for Main Memory', [error_mm_size_unit_field]);
            validInput = false;
        }
        //Gets the type of CM Type
        cmSizeType = cmSelectedOption;
        // code to execute if "Unit" option is selected or if no option is selected
        if (cmSelectedOption === 'Unit') {
            showError(error, 'Please choose a size type for Cache Memory', [error_cm_size_unit_field]);
            validInput = false;
        }

        //Converts the Main Memory Size to the number of bits
        if (mmSize > 0) {
            if (mmSizeType === 'mmSizeBlocks') {
                mmSize = mmSize * blockSize;
            }
            mmBits = getBits(mmSize);
        }

        //Main memory are not needed when the mapping mode is Blocks or Range
        if (MappingMode != 'Blocks' && MappingMode != 'Range') {
            if (mmSize <= 0 || mmBits == -1) {
                //Error message if the user enters an invalid Main Memory Size: 0 or not a power of 2
                showError(error, 'Please enter a valid Main Memory Size', [error_mm_size_field]);
                validInput = false;
            }
        }

        //Converts the Cache Memory Size to the number of blocks
        if (cmSize > 0) {
            if (cmSizeType == 'cmSizeWords') {
                cmSize = cmSize / blockSize;
            }
            blockBits = getBits(cmSize);
        }

        //Error message if the user enters an invalid Cache Memory Size: 0 or not a power of 2
        if (cmSize <= 0 || blockBits == -1) {
            showError(error, 'Please enter a valid Cache Memory Size', [error_cm_size_field]);
            validInput = false;
        }
        mainAT = document.getElementById('mmAccessTime').value;
        if (mainAT <= 0) {
            //Error message if the user enters an invalid Main Memory Access Time: 0 or less
            showError(error, 'Please enter a valid Main Memory Access Time', [error_mm_access_time_field]);
            validInput = false;
        }
        cacheAT = document.getElementById('cAccessTime').value;
        if (cacheAT <= 0) {
            //Error message if the user enters an invalid Cache Memory Access Time: 0 or less
            showError(error, 'Please enter a valid Cache Memory Access Time', [error_cm_access_time_field]);
            validInput = false;
        }
        if (validInput == true) {
            tagBits = mmBits - (blockBits + wordBits);
            if (tagBits <= 0) {
                //Error message if the user enters a Main Memory Size that is too small
                showError(error, 'Please enter a valid Main Memory Size', [error_mm_size_field]);
                validInput = false;
            }
            missPenalty = 2 * cacheAT + blockSize * mainAT;
        }
        passes = document.getElementById('pass').value;
        if (MappingMode != "Multi-loop" && passes <= 0) {
            //Error message if the user enters an invalid number of passes: 0 or less
            showError(error, 'Please enter a valid number of passes', [error_passes_field]);
            console.log('Please enter a valid number of passes');
            validInput = false;
        }
        //check if input is empty
        if (input.value == '') {
            showError(error, 'Please enter a valid input sequence', [error_input_sequence_field]);
            validInput = false;
        }
    }
    //function to print the last values of each cache block
    function printCache() {
        for (let i = 0; i < cache.length; i++) {
            console.log('cache: ' + cache[i][cache[i][0]]);
        }
    }

    //function to convert a range input to a sequence of MM blocks
    function rangeInputSequence() {
        startingBlock = 0;
        let i = 0;
        if (input[0] != 0) {
            while (i < parseInt(input[0])) {
                i += parseInt(blockSize);
                startingBlock++;
            }
        }
        total = parseInt(input[1]) - parseInt(input[0]) + 1;
        numBlocks = total / parseInt(blockSize);
        inputProcessed = new Array(numBlocks);
        for (i = 0; i < numBlocks; i++) {
            inputProcessed[i] = startingBlock + i;
        }
    }
    //function to modulo all the elements in the toProcess array by the number of blocks in the cache
    //and store the result in the inputSequence array
    function moduloInputSequence(toProcess) {
        for (let i = 0; i < toProcess.length; i++) {
            inputSequence[i] = parseInt(toProcess[i]) % cmSize;
        }
    }
    //initialize cache by pushing 0 to the first element of each row in a function
    function initializeCache() {
        for (let i = 0; i < cmSize; i++) {
            cache[i] = new Array(0);
            cache[i].push(0);
        }
    }
    //inputSequence should be an array of predetermined cache block addresses so if
    //input[1] = block 1 then inputSequence[1] = 1
    //Input^^^                cacheBlock^^^
    function simulateCache(processedInput) {
        if (MappingMode == "Multi-loop") passes = 1;
        for (let i = 0; i < passes; i++)
        {
            for (let j = 0; j < inputSequence.length; j++)
            {
                if (cache[inputSequence[j]][0] == 0) {
                    cache[inputSequence[j]].push(processedInput[j]);
                    cache[inputSequence[j]][0]++;
                    miss++;
                } else if (processedInput[j] == cache[inputSequence[j]][cache[inputSequence[j]][0]]) {
                    //hit
                    hit++;
                } else {
                    //miss
                    cache[inputSequence[j]].push(processedInput[j]);
                    cache[inputSequence[j]][0]++;
                    miss++;
                }
            }
        }
    }
    //function to compute the access times
    function computeAccessTimes() {
        hitrate = hit / (hit + miss);
        missrate = miss / (hit + miss);
        averageAccessTime = hitrate * cacheAT + missrate * missPenalty;
        totalHitTime = hit * cacheAT * blockSize;
        miss1 = mainAT * 1 + cacheAT * 1;
        part1 = miss * (blockSize * miss1);
        totalMissTime = part1 + miss * cacheAT;
        totalAccessTime = totalHitTime + totalMissTime;
    }

    function printLogValues() {
        console.log(`%c mmSizeType: %c${mmSizeType}`, "color: white", "color: white");
        console.log(`%c cmSizeType: %c${cmSizeType}`, "color: white", "color: white");

        console.log(`%c blockSize: %c${blockSize}`, "color: magenta", "color: white");
        console.log(`%c mmSize: %c${mmSize}`, "color: magenta", "color: white");
        console.log(`%c cmSize: %c${cmSize}`, "color: magenta", "color: white");
        console.log(`%c mmBits: %c${mmBits}`, "color: magenta", "color: white");

        console.log(`%c tagBits: %c${tagBits}`, "color: yellow", "color: white");
        console.log(`%c blockBits: %c${blockBits}`, "color: yellow", "color: white");
        console.log(`%c wordBits: %c${wordBits}`, "color: yellow", "color: white");

        console.log(`%c missPenalty: %c${missPenalty}`, "color: red", "color: white");
        console.log(`%c inputSequence: %c${inputSequence}`, "color: white", "color: white");
        console.log(`%c input: %c${input}`, "color: white", "color: white");

        //console log for testing with text to identify which value is which starting from SizeType
        console.log(`%c passes: %c${passes}`, "color: white", "color: white");
        console.log(`%c hit: %c${hit}`, "color: green", "color: white");
        console.log(`%c miss: %c${miss}`, "color: red", "color: white");

        console.log(`%c averageAccessTime: %c${averageAccessTime}`, "color: cyan", "color: white");
        console.log(`%c totalAccessTime: %c${totalAccessTime}`, "color: cyan", "color: white");

        outputhtml(hit, miss, missPenalty, averageAccessTime, totalAccessTime, cache);

        //console log cache in a 2D array as a table
        console.table(cache);

        // Concatenate console logs into a single string
        var logs = `mmSizeType: ${mmSizeType}\n` +
        `cmSizeType: ${cmSizeType}\n` +
        `blockSize: ${blockSize}\n` +
        `mmSize: ${mmSize}\n` +
        `cmSize: ${cmSize}\n` +
        `mmBits: ${mmBits}\n` +
        `tagBits: ${tagBits}\n` +
        `blockBits: ${blockBits}\n` +
        `wordBits: ${wordBits}\n` +
        `missPenalty: ${missPenalty}\n` +
        `inputSequence: ${inputSequence}\n` +
        `input: ${input}\n` +
        `passes: ${passes}\n` +
        `hit: ${hit}\n` +
        `miss: ${miss}\n` +
        `averageAccessTime: ${averageAccessTime}\n` +
        `totalAccessTime: ${totalAccessTime}\n` +
        `cache:\n${JSON.stringify(cache)}\n`;

        var output_logs = `Cache Hit: ${hit}\n` +
        `Cache Hit: ${hit}\n` +
        `Cache Miss: ${miss}\n` +
        `Miss Penalty: ${missPenalty}\n` +
        `Average Memory Access Time: ${averageAccessTime}\n` +
        `Total Memory Access Time: ${totalAccessTime}\n\n`;

        table_log = createTextFileContent();
        var newContent = output_logs + table_log;

        // Generate text file from console logs
        fileUrl = generateTextFile(newContent);
        fileName = 'direct_mapping.txt';

        // Trigger download of text file
        //downloadTextFile(fileUrl, fileName);
    }

    function createTextFileContent () {
      // Get the table element
      const table = document.querySelector('#dm-table');

      // Create a variable to hold the plain text content
      let text = '';

      // Iterate over each row of the table
      for (let i = 0; i < table.rows.length; i++) {
        // Iterate over each cell of the row
        for (let j = 0; j < table.rows[i].cells.length; j++) {
          // Add the cell content to the text variable, separated by a pipe symbol
          const cell_text = table.rows[i].cells[j].textContent.trim();
          if (i != 0){
            text += cell_text + '\t\t ';
          }
          else {
            text += cell_text + '\t ';
          }
          if (j < 2) {
            text += '| '
          }

        }
        // Add a line break at the end of the row
        text += '\n';
      }

      return text
    }

    // Function to generate text file from console logs
    function generateTextFile(content) {
        var textFile = null;
        var data = new Blob([content], { type: 'text/plain' });

        // If textFile exists, revoke its object URL to prevent memory leaks
        if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
        }

        // Create a new object URL for the text file
        textFile = window.URL.createObjectURL(data);

        return textFile;
    }


}

// Function to download text file
function downloadTextFile() {
    var downloadLink = document.createElement('a');
    downloadLink.href = fileUrl;
    downloadLink.download = fileName;
    downloadLink.click();
}

// function that creates the html of the simulation output
function outputhtml (hit, miss, missPenalty, averageAccessTime, totalAccessTime, cache) {
  // Select the card-body element and assign it to a variable
  const cardBody = document.querySelector('#out-body');
  // Create a string that contains the desired HTML content
  const html = `
    <div id="values">
    <p><span>Cache Hit:</span> ${hit}</p>
    <p><span>Cache Miss:</span> ${miss}</p>
    <p><span>Miss Penalty:</span> ${missPenalty}</p>
    <p><span>Average Memory Access Time:</span> ${averageAccessTime} ns</p>
    <p><span>Total Memory Access Time:</span> ${totalAccessTime} ns</p>
    </div>
    <div id="sim-table" class="px-2">

    </div>
  `;
  // Update the card-body's innerHTML with the HTML content
  cardBody.innerHTML = html;

  const spanList = document.querySelectorAll('#values span');

  spanList.forEach(span => {
    span.classList.add("fw-bold");
    span.style.color = "#13547a"; // change the color to red
  });

  // output the table
  const simTable = document.querySelector('#sim-table');
  const table = document.createElement('table');
  table.classList.add("table", "table-bordered");
  table.setAttribute("id","dm-table");
  table.style.border = '1px solid grey';
  table.style.width = '60%';

  const maxCol = 3;

  const columns = ['# of Writes', 'Block', 'Data'];
  const maxHead = cache.reduce((max, row) => Math.max(max, row.length), 0);
  var headerlen = 0;
  const headerRow = document.createElement('tr');
  for (let i = 0; i < columns.length; i++) {
    const headerCell = document.createElement('th');
    headerCell.setAttribute('style', 'max-width: 7rem');
    if (i == 2) {
      headerCell.setAttribute('style', 'width: 5em');
    }
    headerCell.textContent = columns[i];
    headerRow.appendChild(headerCell);
    headerlen = i;
  }
  // for (let j = headerlen; j < maxHead; j++) {
  //   const headerCell = document.createElement('th');
  //   headerCell.textContent = "";
  //   headerRow.appendChild(headerCell);
  // }
  table.appendChild(headerRow);

  for (var i = 0; i < cache.length; i++) {
      var row = document.createElement('tr');
      for (var j = 0; j < cache[i].length; j++) {
          if (j >= 1) {
            if (j == 1) {
              var cell = document.createElement('td');
            }
            cell.textContent = cache[i][j];
            cell.setAttribute('style', 'width: 5em');
            row.appendChild(cell);
          }
          // Add index column to the second cell of each row
          else if (j == 0) {
            var cell = document.createElement('td');
            cell.textContent = cache[i][j];
            cell.setAttribute('style', 'width: 5em');
            row.appendChild(cell);
            var cell = document.createElement('td');
            cell.textContent = i;
            cell.setAttribute('style', 'width: 5em; color: #13547a; font-weight: bold');
            row.appendChild(cell);
          }
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
    simTable.appendChild(table);
    console.log("Table exists");
}

// this function just removes the output and scrolls back to the top of the page
// to allow the user to reinput neew values
function reset() {
  document.getElementById("output").classList.add("d-none");
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  // will add code that resets form if needed
}


//function to get the number of bits needed for the input and check if it is a power of 2
//if it is a power of 2, return the number of bits needed
//else return -1
function getBits(num) {
    if (num == 0) {
        return -1;
    }
    let n = 0;
    while (num > 1) {
        if (num % 2 == 0) {
            num = num / 2;
            n++;
        } else {
            return -1;
        }
    }
    return n;
}


function storeLoopValuesToArray() {
    var loopContainer = document.getElementById('loop-container');
    var rows = loopContainer.querySelectorAll('.row'); // Assuming the rows have a class name of 'row'
    var output = [];

    console.log(rows)
    for (var i = 0; i < rows.length; i++)
    {
        var row = rows[i];
        var range = row.querySelector('.range').value;
        var loopNumber = row.querySelector('.loopNumber').value;

        // Split the range into start and end values
        var rangeValues = range.split('-');
        var startValue = parseInt(rangeValues[0]);
        var endValue = parseInt(rangeValues[1]);

        // If the row is indented, count the number of consecutive indented rows below it (excluding current row)
        var consecutiveIndentedRows = 0;
        var nextRow = row.nextElementSibling;

        while (nextRow && nextRow.classList.contains('indent'))
        {
            if (nextRow !== row) consecutiveIndentedRows++;
            nextRow = nextRow.nextElementSibling;
        }

        // Based on the number of loops of current row
        for (var x = 0; x < loopNumber; x++)
        {
            // Push current row values
            for (var j = startValue; j <= endValue; j++)
            {
                output.push(j);
            }

            nextRow = row.nextElementSibling;

            // For each indented row found under current row
            for (var k = 0; k < consecutiveIndentedRows; k++)
            {
                var indentedRange = nextRow.querySelector('.range').value;
                var indentedLoopNumber = nextRow.querySelector('.loopNumber').value;

                var indentedRangeValues = indentedRange.split('-');
                var indentedStartValue = parseInt(indentedRangeValues[0]);
                var indentedEndValue = parseInt(indentedRangeValues[1]);

                // Push indented row values
                for (var y = 0; y < indentedLoopNumber; y++)
                {
                    for (var l = indentedStartValue; l <= indentedEndValue; l++)
                    {
                        output.push(l);
                    }
                }
                // Move to next row
                nextRow = nextRow.nextElementSibling;
            }
        }

        // Skip indented rows
        i += consecutiveIndentedRows;
    }

    return output;
}
