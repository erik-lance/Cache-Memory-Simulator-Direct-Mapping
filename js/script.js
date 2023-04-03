function submit() {
    //clear console log
    console.clear();
    var validInput = true;
    var MappingMode = "Block";
    var blockSize;
    var mmSize;
    var cmSize;
    var mainAT;
    var cacheAT;
    //get inputSeq and store in input then split into an array by comma
    var input = document.getElementById("inputSeq").value.split(",");
    var passes;
    var mDropdown = document.querySelector('#mmSizeDropdown');
    var cDropdown = document.querySelector('#cmSizeDropdown');
    var mmSelectedOption = mDropdown.value;
    var cmSelectedOption = cDropdown.value;
    var mmSizeType;
    var cmSizeType;
    //Process Data
    var mmBits;
    var blockBits;
    var wordBits;
    var tagBits;
    var missPenalty;
    var inputSequence = new Array(input.length);
    var hit = 0;
    var miss = 0;
    var cache;
    var averageAccessTime;
    var totalAccessTime;
    fetchValidateData()
    if (MappingMode === "Block" && validInput == true) {
        moduloInputSequence()
        cache = new Array(cmSize)
        initializeCache()
        simulateCache()
        computeAccessTimes()
    }
    if(validInput == true) {
        console.log("mmSizeType: " + mmSizeType);
        console.log("cmSizeType: " + cmSizeType);
        console.log("blockSize: " + blockSize);
        console.log("mmSize: " + mmSize);
        console.log("cmSize: " + cmSize);
        console.log("mmBits: " + mmBits);
        console.log("tagBits: " + tagBits);
        console.log("blockBits: " + blockBits);
        console.log("wordBits: " + wordBits);
        console.log("missPenalty: " + missPenalty);
        console.log("inputSequence: " + inputSequence);
        console.log("input: " + input);
        //console log for testing with text to identify which value is which starting from SizeType
        console.log("passes: " + passes);
        console.log("hit: " + hit);
        console.log("miss: " + miss);
        console.log("averageAccessTime: " + averageAccessTime);
        console.log("totalAccessTime: " + totalAccessTime);
        //console log cache in a 2D array as a table
        console.table(cache);
    }
    
    
    //This function assigns the size type of the memory and cache to a variable
    //This also calculates the number of bits needed for the Main Memory, tag, block, and word
    function fetchValidateData() {
        blockSize = document.getElementById("blockSize").value;
        mmSize = document.getElementById("mmSizeValue").value;
        cmSize = document.getElementById("cmSizeValue").value;
        if (blockSize > 0) {
            wordBits = getBits(blockSize);
        }
        if (blockSize <= 0 || wordBits == -1) {
            //Error message if the user enters an invalid Block Size: 0 or not a power of 2
            console.log("Please enter a valid Block Size");
            validInput = false;
        }
        mmSizeType = mmSelectedOption;
        if(mmSelectedOption === "Unit") {
            console.log("Please choose a size type for Main Memory");
            validInput = false;
            //Error message if the user selects Unit for Main Memory
        } 
            cmSizeType = cmSelectedOption;
        if(cmSelectedOption === "Unit") {
            console.log("Please choose a size type for Cache Memory");
            validInput = false;
            // code to execute if "Unit" option is selected or if no option is selected
        }
        //if mmSizeType is words, convert to blocks by dividing by blockSize
        if (cmSize > 0) {
            if(cmSizeType == "cmSizeWords") {
                cmSize = cmSize / blockSize;
            }
            blockBits = getBits(cmSize);
        }
        if(cmSize <= 0 || blockBits == -1) {
            //Error message if the user enters an invalid Cache Memory Size: 0 or not a power of 2
            console.log("Please enter a valid Cache Memory Size");
            validInput = false;
        }
        if(mmSize > 0){
            if(mmSizeType === "mmSizeBlocks") {
                mmSize = mmSize * blockSize;
            }
            mmBits = getBits(mmSize);
        }
        if(mmSize <= 0 || mmBits == -1) {
            //Error message if the user enters an invalid Main Memory Size: 0 or not a power of 2
            console.log("Please enter a valid Main Memory Size");
            validInput = false;
        }
        mainAT = document.getElementById("mmAccessTime").value;
        if(mainAT <= 0) {
            //Error message if the user enters an invalid Main Memory Access Time: 0 or less
            console.log("Please enter a valid Main Memory Access Time");
            validInput = false;
        }
        cacheAT = document.getElementById("cAccessTime").value;
        if(cacheAT <= 0) {
            //Error message if the user enters an invalid Cache Memory Access Time: 0 or less
            console.log("Please enter a valid Cache Memory Access Time");
            validInput = false;
        }
        if (validInput == true) {
            tagBits = mmBits - (blockBits + wordBits);
            if(tagBits <= 0) {
                //Error message if the user enters a Main Memory Size that is too small
                console.log("Please enter valid Main Memory Size");
                validInput = false;
            }
            missPenalty = (2 * cacheAT) + (blockSize * mainAT)
        }
        passes = document.getElementById("pass").value;
        if(passes <= 0) {
            //Error message if the user enters an invalid number of passes: 0 or less
            console.log("Please enter a valid number of passes");
            validInput = false;
        }
        //check if input is empty
        if(input.value == "") {
            console.log("Please enter a valid input sequence");
            validInput = false;
        }
    }
    //create a function to get n of 2^n of a given number
    function getBits(num) {
        if (num == 0) {
            return -1;
        }
        var n = 0;
        while(num > 1) {
            if(num % 2 == 0) {
                num = num / 2;
                n++;
            } else {
                return - 1;
            }
        }
        return n;
    }
    //function to modulo all the elements in the inputSequence array by the number of blocks in the cache
    function moduloInputSequence() {
        for(var i = 0; i < input.length; i++) {
            inputSequence[i] = parseInt(input[i]) % cmSize;
        }
    }
    //initialize cache by pushing 0 to the first element of each row in a function
    function initializeCache() {
        for(var i = 0; i < cmSize; i++) {
            cache[i] = new Array(0);
            cache[i].push(0);
        }
    }
    function simulateCache(){
        for(var i = 0; i < passes; i++) {
            for(var j = 0; j < inputSequence.length; j++) {
                if(cache[inputSequence[j]][0] == 0 ){
                    cache[inputSequence[j]].push(input[j]);
                    cache[inputSequence[j]][0]++;
                    miss++; 
                } else if(input[j] == cache[inputSequence[j]][cache[inputSequence[j]][0]]) {
                    //hit
                    hit++;
                } else {
                    //miss
                    cache[inputSequence[j]].push(input[j]);
                    cache[inputSequence[j]][0]++;
                    miss++;
                }
            }
        }
    }
    function computeAccessTimes(){
        hitrate = hit/(hit+miss);
        missrate = miss/(hit+miss);
        averageAccessTime = (hitrate*cacheAT) + (missrate*missPenalty);
        totalHitTime = hit * cacheAT * blockSize;
        miss1 = (mainAT * 1 + cacheAT * 1);
        part1 = miss * (blockSize * miss1);
        totalMissTime = part1 + (miss * cacheAT);
        totalAccessTime = totalHitTime + totalMissTime;
    }
    //console log for testing with text to identify which value is which
    /*
    console.log("Block Size: " + blockSize);
    console.log("mmSizeValue: " + mmSizeValue);
    console.log("cmSizeValue: " + cmSizeValue);
    console.log("mmAccessTime: " + mainAT);
    console.log("cAccessTime: " + cacheAT);
    console.log("inputSequence: " + inputSequence);
    console.log("passes: " + passes);*/
}   