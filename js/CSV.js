let separator = ',';

module.exports = (function CSV() {
    function toCSV(array) {
        let parsedCSV = '';

        //iterate the array
        for (let i = 0; i < array.length; i++) {
            const object = array[i];
            
            //iterate the object in the array
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    const element = object[key];
                    parsedCSV+= `"${element}"${separator}`;
                }
            }
            //add a break line
            parsedCSV+='\n';
        }
        return parsedCSV;
    }


    const methods = {
        toCSV: toCSV
    }

    return methods;
})();
