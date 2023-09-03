export class Data {
    constructor(grid) {
        this.grid = grid;

    }

    transformJsontoCSV(jsonData) {
        let transformedData = [];
        
        if (jsonData.length > 0) {
            let keys = Object.keys(jsonData[0]);

            transformedData.push(keys);
        
            jsonData.forEach(obj => {
              let values = keys.map(key => obj[key]);
              transformedData.push(values);
            });
        }
        
        return transformedData;
    }

    getCSVData() {
        var csvStr = "";
    
        // loop over _rowList, then _colList
        for (var y = 0; y < this.grid._rowList.length; y++) {
            for (var x = 0; x < this.grid._colList.length; x++) {
                csvStr += this.grid._cellStore[this.grid._rowList[y]-1][this.grid._colList[x]-1].value || "";
                if (x < this.grid._colList.length - 1) {
                csvStr += ",";
                }
            }
            csvStr += "\n";
        }
        return csvStr;
    }

    getJSONData() {
        let jsonData = [];
        
        for (let y = 1; y < this.grid._rowList.length; y++) {
            let keyCounter = 1;
            let row = {};
            for (let x = 0; x < this.grid._colList.length; x++) {
                let cellValue = this.grid._cellStore[this.grid._rowList[y] - 1][this.grid._colList[x] - 1].value || "";
                let columnName = this.grid._cellStore[this.grid._rowList[0] - 1][this.grid._colList[x] - 1].value || "";
                if (columnName == "") {
                    let autoGeneratedKey = "key_" + keyCounter++;
                    row[autoGeneratedKey] = cellValue;
                } else {
                    keyCounter++;
                    row[columnName] = cellValue;
                }
            }
            jsonData.push(row);
        }
    
        return jsonData;
    }
    

    cleanData (json, fileName, callback) {
        let originJson = JSON.parse(JSON.stringify(json));
        console.log("originJson", originJson);
        let jsonDataLength = json.length;
        let emptyCellCount = 0;

        let isEmpty;
        for (let i = json.length - 1; i >= 0; i--) {
            let row = json[i];
            isEmpty = false;
            for (let key in row) {
                if (row[key] === null || row[key] === "") {
                    isEmpty = true;
                    break;
                }
            }
            if (isEmpty) {
                emptyCellCount++;
                json.splice(i, 1);
            }
        }

        let uniqueData = [...new Set(json.map(JSON.stringify))].map(JSON.parse);

        // So sánh nội dung của uniqueData và document_data
        let isDataChanged = JSON.stringify(uniqueData) !== JSON.stringify(originJson);

        if (isDataChanged || isEmpty) {
            // document_data = uniqueData;
            let fileData = this.transformJsontoCSV(uniqueData);
            let result = {
                fileName: fileName,
                fileData: fileData
            }
            callback(result);
        } else {
            console.log("No changes in data.");
        }

        let duplicateCount = jsonDataLength - uniqueData.length - emptyCellCount;

        Swal.fire(
            'Cleaning Data Sucessfully!',
            `Removed ${duplicateCount} duplicate rows.<br>Removed ${emptyCellCount} rows with empty cells`,
            'success'
        )
    }

    evaluateFormula(formula, grid) {
        // Đảm bảo rằng công thức chỉ chứa các ký tự hợp lệ
        var validChars = /[A-Z][1-3000]|\+|\-|\*|\//g;
        if (!validChars.test(formula)) {
            return "Invalid formula";
        }
        
        var parts = formula.match(/[A-Z][1-9]\d{0,2}|\+|\-|\*|\//g);
        console.log(parts);
        
        // Thực hiện các phép tính
        var result = 0;
        var operator = "+";
        
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
        
            if (part.match(/[A-Z][1-9]\d{0,2}/)) {
                var x = part.charCodeAt(0) - 65; // Chuyển A->0, B->1, ...
                var y = parseInt(part.charAt(1)) - 1;
                var cellValue = grid._cellStore[grid._rowList[y]-1][grid._colList[x]-1].value;
                console.log(cellValue);
            if (operator === "+") {
                result += parseFloat(cellValue);
                console.log("KetQua");
                console.log(result);
            } else if (operator === "-") {
                result -= parseFloat(cellValue);
            } else if (operator === "*") {
                result *= parseFloat(cellValue);
            } else if (operator === "/") {
                result /= parseFloat(cellValue);
            }
            } else {
            operator = part;
            }
        }

        return result;
    }
        
}