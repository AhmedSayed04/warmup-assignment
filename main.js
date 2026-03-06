const fs = require("fs");
//parser functions
function parseTimeToSeconds(timeStr) {
    timeStr = timeStr.trim().toLowerCase();
    const isPM = timeStr.endsWith("pm");
    const isAM = timeStr.endsWith("am");
    const [h, m, s] = timeStr.replace("am","").replace("pm","").trim().split(":").map(Number);
    let hours = h;
    if (isPM && hours !== 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 3600 + m * 60 + s;
}

function parseDurationToSeconds(durStr) {
    const [h, m, s] = durStr.trim().split(":").map(Number);
    return h * 3600 + m * 60 + s;
}

function formatSeconds(totalSecs) {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    // TODO: Implement this function
    let start = parseTimeToSeconds(startTime);
    let end   = parseTimeToSeconds(endTime);
    if (end < start) end += 24 * 3600;
    return formatSeconds(end - start);
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    // TODO: Implement this function
        let start = parseTimeToSeconds(startTime);
    let end   = parseTimeToSeconds(endTime);
    if (end < start) end += 24 * 3600;
    const shiftSecs = end - start;
    return formatSeconds(shiftSecs % (7 * 3600));
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    // TODO: Implement this function
     return formatSeconds(
        parseDurationToSeconds(shiftDuration) - parseDurationToSeconds(idleTime)
    );
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    // TODO: Implement this function
        const d        = new Date(date);
    const eidStart = new Date("2025-04-13");
    const eidEnd   = new Date("2025-04-17");
    const quota    = (d >= eidStart && d <= eidEnd) ? 6 * 3600 : 8 * 3600 + 24 * 60;
    return parseDurationToSeconds(activeTime) >= quota;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function
        const { driverID, driverName, date, startTime, endTime } = shiftObj;
    const content = fs.existsSync(textFile) ? fs.readFileSync(textFile, "utf8") : "";
    const lines = content.split("\n").filter(l => l.trim());
    for (let i = 1; i < lines.length; i++) {
        const p = lines[i].split(",");
        if (p[0] === driverID && p[2] === date) return {};
    }
    const shiftDuration = getShiftDuration(startTime, endTime);
    const idleTime      = getIdleTime(startTime, endTime);
    const activeTime    = getActiveTime(shiftDuration, idleTime);
    const quotaMet      = metQuota(date, activeTime);
    const hasBonus      = false;
    const record = { driverID, driverName, date, startTime, endTime,
                     shiftDuration, idleTime, activeTime, metQuota: quotaMet, hasBonus };
    const line = [driverID, driverName, date, startTime, endTime,
                  shiftDuration, idleTime, activeTime, quotaMet, hasBonus].join(",");
    fs.appendFileSync(textFile, "\n" + line, "utf8");
    return record;
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
       const lines = fs.readFileSync(textFile, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
        const p = lines[i].split(",");
        if (p[0] === driverID && p[2] === date) {
            p[p.length - 1] = String(newValue);
            lines[i] = p.join(",");
            break;
        }
    }
    fs.writeFileSync(textFile, lines.join("\n"), "utf8");
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
       const lines = fs.readFileSync(textFile, "utf8").split("\n").filter(l => l.trim());
    const targetMonth = String(parseInt(month)).padStart(2, "0");
    let found = false, count = 0;
    for (let i = 1; i < lines.length; i++) {
        const p = lines[i].split(",");
        if (p[0] !== driverID) continue;
        found = true;
        if (p[2].split("-")[1] === targetMonth &&
            p[p.length - 1].trim().toLowerCase() === "true") count++;
    }
    return found ? count : -1;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
        const lines = fs.readFileSync(textFile, "utf8").split("\n").filter(l => l.trim());
    const targetMonth = String(parseInt(month)).padStart(2, "0");
    let totalSecs = 0;
    for (let i = 1; i < lines.length; i++) {
        const p = lines[i].split(",");
        if (p[0] === driverID && p[2].split("-")[1] === targetMonth)
            totalSecs += parseDurationToSeconds(p[7].trim());
    }
    return formatSeconds(totalSecs);
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
        const lines = fs.readFileSync(textFile, "utf8").split("\n").filter(l => l.trim());
    const targetMonth = String(parseInt(month)).padStart(2, "0");
    let numShifts = 0;
    for (let i = 1; i < lines.length; i++) {
        const p = lines[i].split(",");
        if (p[0] === driverID && p[2].split("-")[1] === targetMonth) numShifts++;
    }
    const rateLines = fs.readFileSync(rateFile, "utf8").split("\n").filter(l => l.trim());
    let col4 = 0;
    for (const line of rateLines) {
        const p = line.split(",");
        if (p[0] === driverID) { col4 = parseInt(p[3]); break; }
    }
    const normalQuotaSecs = 8 * 3600 + 24 * 60;
    const bonusUnitSecs   = 3 * 3600 + 24 * 60;
    const totalSecs = Math.max(0, numShifts * normalQuotaSecs - bonusCount * col4 * bonusUnitSecs);
    return formatSeconds(totalSecs);
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
        const actualSecs   = parseDurationToSeconds(actualHours);
    const requiredSecs = parseDurationToSeconds(requiredHours);
    const rateLines = fs.readFileSync(rateFile, "utf8").split("\n").filter(l => l.trim());
    let salary = 0, col4 = 0;
    for (const line of rateLines) {
        const p = line.split(",");
        if (p[0] === driverID) { salary = parseInt(p[2]); col4 = parseInt(p[3]); break; }
    }
    if (actualSecs >= requiredSecs) return salary;
    const thresholdSecs = (salary / (col4 * 100)) * 3600;
    if (actualSecs >= thresholdSecs) return salary;
    const excessSecs   = thresholdSecs - actualSecs;
    const excessMins   = Math.ceil(excessSecs / 60);
    const requiredMins = Math.round(requiredSecs / 60);
    const deduction = Math.floor((excessMins - 1) * salary / (requiredMins * col4 * col4));;
    return salary - deduction;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
