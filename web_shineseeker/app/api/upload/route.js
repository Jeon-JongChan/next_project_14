import path from "path";
import {NextResponse} from "next/server";
import {saveFiles, saveData} from "@/_custom/scripts/server";
import {devLog} from "@/_custom/scripts/common";

// upload에 대한 post 요청을 처리하는 함수
export async function POST(req) {
  try {
    let filePaths = [];
    const data = await req.formData();
    const apitype = data.get("apitype");
    // console.log(data.get("apitype"), data);
    if (apitype === "update_user") {
      filePaths = await updateUser(data);
      return NextResponse.json({message: "upload User And Images uploaded successfully", filePaths});
    } else if (apitype === "test") {
      await test(data);
      return NextResponse.json({message: "successfully api"});
    }

    return NextResponse.json({message: "Files uploaded successfully", filePaths});
  } catch (error) {
    return NextResponse.json({error: error.message}, {status: 500});
  }
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, since we are handling it ourselves
  },
};
// --------------- 아래는 upload 요청 중 api type에 따른 함수리스트
async function updateUser(data) {
  const dataList = ["userpw", "username", "profill", "job", "level", "stat", "skill", "money"];
  let imagePaths = [];
  let user = {};
  if (!dataList.every((key) => data.has(key))) throw new Error("One or more fields are missing");
  const files = data.getAll("file");
  if (files.length === 0 || files.some((file) => file.type.split("/")[0] !== "image")) throw new Error("One or more files are not images");
  imagePaths = await saveFiles(files);

  let userid = data.get("userid");
  user[userid] = {};
  dataList.forEach((key) => (user[userid][key] = data.get(key)));

  // devLog("api/upload/route.js updateUser : ", imagePaths);
  user["imagePaths"] = "/temp/uploads/" + imagePaths;

  await saveData("user", user);

  return imagePaths;
}

async function test(data) {
  const dataList = ["userpw", "username", "profill", "job", "level", "stat", "skill", "money"];
  let imagePaths = [];
  let user = {};
  if (!dataList.every((key) => data.has(key))) throw new Error("One or more fields are missing");

  let userid = data.get("userid");
  user[userid] = {};
  dataList.forEach((key) => (user[userid][key] = data.get(key)));

  const files = data.getAll("file");
  if (files.length === 0 || files.some((file) => file.type.split("/")[0] !== "image")) throw new Error("One or more files are not images");
  else imagePaths = await saveFiles(files);

  // devLog("api/upload/route.js updateUser : ", imagePaths);
  user["imagePaths"] = imagePaths;

  await saveData("test", user);

  return imagePaths;
}
