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
        if (MappingMode == 'Blocks') {
            inputProcessed = input.split(',');
        }

        if (MappingMode == 'Range') {
            input = input.split('-');
            rangeInputSequence();
        }

        inputSequence = new Array(inputProcessed.length);
        moduloInputSequence(inputProcessed);
        cache = new Array(cmSize);
        initializeCache();
        simulateCache(inputProcessed);
        computeAccessTimes();

        printLogValues();
    }

    //This function assigns the size type of the memory and cache to a letiable
    //This also calculates the number of bits needed for the Main Memory, tag, block, and word
    function fetchValidateData() {
        blockSize = $('#blockSize').val();
        [mmSize, cmSize] = [$('#mmSizeValue').val(), $('#cmSizeValue').val()];

        //Converts the Block Size to the number of bits and checks if it is a power of 2
        if (blockSize > 0) {
            wordBits = getBits(blockSize);
        }
        //Error message if the user enters an invalid Block Size: 0 or not a power of 2
        if (blockSize <= 0 || wordBits == -1) {
            console.log('Please enter a valid Block Size');
            validInput = false;
        }
        mmSizeType = mmSelectedOption;
        //Main Memory is not needed when the mapping mode is Blocks or Range
        if (mmSelectedOption === 'Unit' && !(MappingMode == 'Blocks' || MappingMode == 'Range')) {
            console.log('Please choose a size type for Main Memory');
            validInput = false;
            //Error message if the user selects Unit for Main Memory
        }
        //Gets the type of CM Type
        cmSizeType = cmSelectedOption;
        // code to execute if "Unit" option is selected or if no option is selected
        if (cmSelectedOption === 'Unit') {
            console.log('Please choose a size type for Cache Memory');
            validInput = false;
        }

        //Main memory are not needed when the mapping mode is Blocks or Range
        if (MappingMode != 'Blocks' && MappingMode != 'Range') {
            if (mmSize > 0) {
                if (mmSizeType === 'mmSizeBlocks') {
                    mmSize = mmSize * blockSize;
                }
                mmBits = getBits(mmSize);
            }
            if (mmSize <= 0 || mmBits == -1) {
                //Error message if the user enters an invalid Main Memory Size: 0 or not a power of 2
                console.log('Please enter a valid Main Memory Size');
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
            console.log('Please enter a valid Cache Memory Size');
            validInput = false;
        }
        mainAT = document.getElementById('mmAccessTime').value;
        if (mainAT <= 0) {
            //Error message if the user enters an invalid Main Memory Access Time: 0 or less
            console.log('Please enter a valid Main Memory Access Time');
            validInput = false;
        }
        cacheAT = document.getElementById('cAccessTime').value;
        if (cacheAT <= 0) {
            //Error message if the user enters an invalid Cache Memory Access Time: 0 or less
            console.log('Please enter a valid Cache Memory Access Time');
            validInput = false;
        }
        if (validInput == true) {
            tagBits = mmBits - (blockBits + wordBits);
            if (tagBits <= 0) {
                //Error message if the user enters a Main Memory Size that is too small
                console.log('Please enter valid Main Memory Size');
                validInput = false;
            }
            missPenalty = 2 * cacheAT + blockSize * mainAT;
        }
        passes = document.getElementById('pass').value;
        if (passes <= 0) {
            //Error message if the user enters an invalid number of passes: 0 or less
            console.log('Please enter a valid number of passes');
            validInput = false;
        }
        //check if input is empty
        if (input.value == '') {
            console.log('Please enter a valid input sequence');
            validInput = false;
        }
    }
    //function to print the last values of each cache block
    function printCache() {
        for (let i = 0; i < cache.length; i++) {
            console.log('cache: ' + cache[i][cache[i][0]]);
        }
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

        //console log cache in a 2D array as a table
        console.table(cache);
    }

}
