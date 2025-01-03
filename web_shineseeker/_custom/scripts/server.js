import {promises as fs} from "fs";
import path from "path";
import jsondb from "./jsondb.js";
import Sqlite from "./sqlite3-adapter.js";
import SqliteQuery from "./sqlite3-query.js";
import {devLog} from "./common.js";

export {saveFiles, saveImage, saveData, updateData, deleteData, truncateData, getData, getDataKeyTimeCheck, getDataKey, executeSelectQuery, executeQuery, updateTableTime};

const dev = process.env.NEXT_PUBLIC_DEV === "true";
const sqlite = new Sqlite(dev); // 기본 dbPath 사용, verbose 출력 활성화

async function saveFiles(files, uploadDir = undefined) {
  try {
    if (!uploadDir) uploadDir = "public/temp/uploads";
    console.info("server.js saveFiles uploadDir : ", uploadDir);
    await fs.mkdir(uploadDir, {recursive: true});

    const fileUploadPromises = files.map(async (file) => {
      const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);
      const savename = path.basename(filePath);

      // 파일 정보 (lastModified, size) 가져오기
      const {lastModified, size, name} = file;

      // DB에서 중복 파일 조회
      const isDuplicate = checkDuplicateImageFile(name, size);
      devLog("sever.js saveFiles", name, lastModified, size, isDuplicate);
      if (!isDuplicate) {
        const buffer = Buffer.from(await file.arrayBuffer());
        // 중복이 아닌 경우 파일 저장
        await fs.writeFile(filePath, buffer);
        return savename; // 저장한 파일명 반환
      } else {
        // 중복 파일이 있는 경우 저장 생략
        console.info(`******** server.js saveFiles : 동일 파일 (크기, 파일명 ) 저장 생략: ${name} ${filePath}`);
        return isDuplicate; // 중복된 파일은 null 반환
      }
    });
    return await Promise.all(fileUploadPromises); // 모든 파일 업로드 작업이 완료될 때까지 대기하고, 완료되면 파일 경로들의 배열을 반환
  } catch (e) {
    console.error("server.js saveFiles Function : ", e);
    return [];
  }
}

async function saveImage(file, imageDir = "/temp/uploads") {
  if (file.type.split("/")[0] !== "image") throw new Error(`${file.name} file is not an image`);
  const imagePath = await saveFiles([file]);
  const imageData = {
    name: imagePath[0],
    basename: file.name,
    size: file.size,
    lastModified: file.lastModified,
    path: `${imageDir}/${imagePath[0]}`,
  };
  await saveData("images", imageData);
  return imageData;
}

// 중복 파일 체크 함수
function checkDuplicateImageFile(name, size) {
  if (!sqlite.tableExists("images")) sqlite.db.exec(SqliteQuery.create.images);
  // devLog("server.js checkDuplicateImageFile : ", name, size);
  let result = sqlite.db.prepare("SELECT name, MAX(path) as path, COUNT(*) as count FROM images WHERE basename = ? AND size = ? GROUP BY name").get(name, size);
  return result?.count > 0 ? result.name : null;
}

async function saveData(table, data, isObjectArray = false) {
  // jsondb.updateObject(key, data);
  try {
    if (!sqlite.tableExists(table)) {
      const isQuery = SqliteQuery?.create?.[table];
      if (isQuery) sqlite.db.exec(isQuery);
      else if (!isQuery && !isObjectArray) sqlite.createTableFromObject(table, data, true);
      else {
        if (Array.isArray(data)) sqlite.createTableFromObject(table, data[0], true);
        else sqlite.createTableFromObject(table, data, true);
      }
    }
    if (!isObjectArray) sqlite.insert(table, data);
    else sqlite.multiInsert(table, data);
  } catch (e) {
    console.error("server.js saveData Function : ", e);
    return null;
  }
}

async function updateData(table, key, keyValue, data) {
  if (!sqlite.tableExists(table)) {
    const isQuery = SqliteQuery?.create?.[table];
    if (isQuery) sqlite.db.exec(isQuery);
    else if (!isQuery) sqlite.createTableFromObject(table, data, true);
    else {
      if (Array.isArray(data)) sqlite.createTableFromObject(table, data[0], true);
      else sqlite.createTableFromObject(table, data, true);
    }
  }
  sqlite.updateByKey(table, key, keyValue, data);
}

async function deleteData(table, key, keyValue) {
  // jsondb.deleteObject(key);
  sqlite.deleteByKey(table, key, keyValue);
}

async function truncateData(table) {
  // jsondb.deleteObject(key);
  sqlite.truncate(table);
}
/**
 * @param {*} table
 * @param {int} timeSecondgap
 * @returns
 */
async function getData(table, timeSecondgap = 0, isAll = false, options = {}) {
  try {
    if (!sqlite.tableExists(table)) return null;
    if (timeSecondgap) {
      const tableTime = sqlite.getTableTime(table);
      // devLog("server.js getData", timeSecondgap, table, tableTime, Date.now() - timeSecondgap * 1000, tableTime > Date.now() - timeSecondgap * 1000);
      if (tableTime > Date.now() - timeSecondgap * 1000) return sqlite.searchAll(table, !isAll, options);
    } else return sqlite.searchAll(table, !isAll, options);
    return null;
  } catch (e) {
    console.error("server.js getData Function : ", e);
    return null;
  }
}

/**
 * @param {*} table
 * @param {int} timeSecondgap
 * @returns
 */
async function getDataKeyTimeCheck(table, key, keyValue, timeSecondgap = 0, isAll = false, options = {}) {
  try {
    let result = null;
    if (!sqlite.tableExists(table)) return null;
    if (timeSecondgap) {
      const tableTime = sqlite.getTableTime(table);
      if (tableTime > Date.now() - timeSecondgap * 1000) return sqlite.searchByKeyAll(table, key, keyValue, !isAll, options);
    } else return sqlite.searchByKeyAll(table, key, keyValue, !isAll, options);
    return null;
  } catch (e) {
    console.error("server.js getDataKeyTimeCheck Function : ", e);
    return null;
  }
}

/**
 * @param {*} key
 * @param {int} timeSecondgap
 * @param {*} isAll
 * @param {*} options
 * @returns
 */
async function getDataKey(table, key, keyValue, isAll = false, options = {}) {
  try {
    // devLog("server.js getDataKey", table, key, keyValue, isAll, options);
    if (!sqlite.tableExists(table)) return null;
    if (isAll) return sqlite.searchByKeyAll(table, key, keyValue, !isAll, options);
    else return sqlite.searchByKey(table, key, keyValue);
  } catch (e) {
    console.error("server.js getDataKey Function : ", e);
    return null;
  }
}

async function executeSelectQuery(query, value = null) {
  try {
    return sqlite.db.prepare(query).all(value);
  } catch (error) {
    console.error("** server.js(executeSelectQuery) failed:", error);
    return null; // 실패 시 null 반환
  }
}
async function executeQuery(table, query, value = null) {
  try {
    sqlite.updateTableTime(table);
    return sqlite.db.prepare(query).run(value);
  } catch (error) {
    console.error("** server.js(executeSelectQuery) failed:", error);
    return null; // 실패 시 null 반환
  }
}

async function updateTableTime(table) {
  sqlite.updateTableTime(table);
}
