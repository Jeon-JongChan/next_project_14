"use client";
import {updateDataWithFormInputs} from "/_custom/scripts/client";
import React, {useState, useEffect} from "react";
import {devLog} from "@/_custom/scripts/common";
import ListItemIndex from "/_custom/components/_common/ListItemIndex";
import GridInputButton from "/_custom/components/_common/grid/GridInputButton";
import GridInputText from "/_custom/components/_common/grid/GridInputText";
import GridInputSelectBox from "/_custom/components/_common/grid/GridInputSelectBox";
import FileDragAndDrop from "/_custom/components/_common/FileDragAndDrop";
import Tooltip from "@/_custom/components/_common/TooltipFixed";
import MakeInputList from "./MakeInputList";
import UserLogViewer from "./UserLogViewer";
import Autocomplete from "@/_custom/components/_common/Autocomplete";
import InputTextList from "../InputTextList";
import NotificationModal from "@/_custom/components/NotificationModal";
import {getImageUrl} from "@/_custom/scripts/client";

const menuName = "user";
export default function Home() {
  const [userdata, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [clickUserImage, setClickUserImage] = useState([]);
  const [checkboxOptionList, setCheckboxOptionList] = useState({skill: [""], job: [""]});
  const [itemList, setItemList] = useState([]);
  const [skillList, setSkillList] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [userLog, setUserLog] = useState([]);
  const [noti, setNoti] = useState(null);
  let fetchIndex = 0;

  // ** id에 하이푼(-) 대신 언더바(_) 사용할 것 (sql 컬럼명과 동일하게)
  const changeHandler = (event) => {
    const jobs = checkboxOptionList.jobs.filter((job) => job.job_name === event.target.value);
    devLog("changeHandler", event.target.value, checkboxOptionList.job, jobs);
    let dom = document.querySelector("#user_hp");
    if (dom && jobs[0]) dom.value = dom.value || jobs[0].job_hp;
    dom = document.querySelector("#user_atk");
    if (dom && jobs[0]) dom.value = dom.value || jobs[0].job_atk;
    dom = document.querySelector("#user_def");
    if (dom && jobs[0]) dom.value = dom.value || jobs[0].job_def;
    dom = document.querySelector("#user_wis");
    if (dom && jobs[0]) dom.value = dom.value || jobs[0].job_wis;
    dom = document.querySelector("#user_agi");
    if (dom && jobs[0]) dom.value = dom.value || jobs[0].job_agi;
    dom = document.querySelector("#user_luk");
    if (dom && jobs[0]) dom.value = dom.value || jobs[0].job_luk;
  };

  const userinputNames = [
    {header: "일반 설정", label: "아이디", id: "userid", colSpan: 3},
    {label: "비밀번호", id: "userpw", colSpan: 3},
    {label: "첫번째 닉네임", id: "username1", colSpan: 3},
    {label: "두번째 닉네임", id: "username2", colSpan: 3},
    {label: "유저 현재 스테미나", id: "user_stamina", type: "number", max: 5, min: 0, css: " h-[36px]", colSpan: 6},
    {label: "직업", id: "job", colSpan: 6, inputType: "checkbox", class: "job", onchange: changeHandler},
    {label: "추가정보", id: "addinfo1", colSpan: 6},
    {label: "추가정보2", id: "addinfo2", colSpan: 6},
    {header: "탭 내용", label: "탭 기본정보", id: "usertab_baseinfo", inputType: "textarea", colSpan: 12},
    {label: "탭 상세정보", id: "usertab_detailinfo", inputType: "textarea", colSpan: 12},
    {label: "첫번째 탭 한마디", id: "usertab_first_word", colSpan: 6},
    {label: "두번째 탭 한마디", id: "usertab_second_word", colSpan: 6},
    {header: "스테이터스", label: "HP", id: "user_hp", type: "number", colSpan: 2, max: 200, min: 0},
    {label: "ATK", id: "user_atk", type: "number", colSpan: 2, max: 200, min: 0},
    {label: "DEF", id: "user_def", type: "number", colSpan: 2, max: 200, min: 0},
    {label: "WIS", id: "user_wis", type: "number", colSpan: 2, max: 200, min: 0},
    {label: "AGI", id: "user_agi", type: "number", colSpan: 2, max: 200, min: 0},
    {label: "LUK", id: "user_luk", type: "number", colSpan: 2, max: 200, min: 0},
    {header: "습득 스펠", label: "스킬1", id: "user_skill1", inputType: "checkbox", class: "skill", colSpan: 2},
    {label: "스킬2", id: "user_skill2", inputType: "checkbox", class: "skill", colSpan: 2},
    {label: "스킬3", id: "user_skill3", inputType: "checkbox", class: "skill", colSpan: 2},
    {label: "스킬4", id: "user_skill4", inputType: "checkbox", class: "skill", colSpan: 2},
    {label: "스킬5", id: "user_skill5", inputType: "checkbox", class: "skill", colSpan: 2},
    {header: "보유 재화", label: "금화", id: "user_money", type: "number", colSpan: 10},
    {label: "단위", id: "user_money", inputType: "text", text: "AKA", colSpan: 2},
  ];

  const handleSubmitUser = (e) => {
    e.preventDefault();
    const apitype = e.target.dataset.apitype;
    const addObject = {};

    // 각 select의 id와 선택된 value를 가져와 result 객체에 저장
    const selectElements = e.target.querySelectorAll("select");
    selectElements.forEach((select) => {
      addObject[select.id] = select.value; // id: value 형태로 저장
    });

    // textarea의 id와 value를 가져와 result 객체에 저장
    const textareaElements = e.target.querySelectorAll("textarea");
    textareaElements.forEach((textarea) => {
      addObject[textarea.id] = textarea.value; // id: value 형태로 저장
    });

    devLog("handleSubmitUser", apitype);
    updateDataWithFormInputs(e, apitype, "admin/upload", addObject, true);
    setNoti("유저 정보가 업데이트 되었습니다.");
  };

  const clickUser = (e) => {
    setSelectedUser(e.target.dataset.name);
    const userIndex = e.target.dataset.index;
    const data = userdata?.[userIndex];
    if (data) {
      // setClickUserImage(userdata?.[userIndex]?.["imagePaths"]);
      // 1. 일반 input 값 채우기
      const updataFormInputList = document.querySelectorAll(".user-form form input");
      devLog("clickUser", e.target.dataset.name, data, clickUserImage);

      updataFormInputList.forEach((input) => {
        if (input.id.startsWith("user_img_") || input.id.startsWith("user_item_")) return; // 특수 input은 제외
        try {
          input.value = data[input.id];
        } catch (e) {
          console.error(input, e);
        }
      });
      // 2. 이미지 채우기
      devLog("clickUserImage", [data["user_img_0"], data["user_img_1"], data["user_img_2"], data["user_img_3"]]);
      setClickUserImage([data["user_img_0"] || "init", data["user_img_1"] || "init", data["user_img_2"] || "init", data["user_img_3"] || "init", data["user_img_4"] || "init"]);
      // 3. 스킬(select) 채우기
      const selectElements = document.querySelectorAll(".user-form form select");
      selectElements.forEach((select) => {
        select.value = data[select.id];
      });
      // 4.textarea 채우기
      const textareaElements = document.querySelectorAll(`.${menuName}-form form textarea`);
      textareaElements.forEach((textarea) => {
        textarea.value = data[textarea.id];
      });
      // 5. 아이템 및 스킬 채우기
      setItemList(data?.items ? [...data.items] : []);
      setSkillList(data?.skills ? [...data.skills.map((skill) => skill.name)] : []);
      if (data?.logs?.length) setUserLog([...data.logs]);
      else setUserLog([]);
    }
  };

  // fileDragAndDrop에서 이미지를 바꿀경우 상위 stat 수정
  const imgInitFn = (event) => {
    const id = event.target.id;
    const files = Array.from(event.target.files);
    devLog("imgInitFn : ", id);
    // id 끝자리에서 index를 추출하여 해당 index의 이미지를 초기화
    if (!id || files.length == 0) return;
    const index = id.slice(-1);
    const clickUserImageCopy = [...clickUserImage];
    clickUserImageCopy[index] = null;
    setClickUserImage(clickUserImageCopy);
    devLog("imgInitFn : ", clickUserImageCopy);
  };

  const addItem = (e) => {
    const item = document.querySelector("#user_item_add").value;
    if (item) {
      setItemList([...itemList, item]);
    }
  };

  const addSkill = (e) => {
    const item = document.querySelector("#user_skillList_add").value;
    if (item) {
      setSkillList([...skillList, item]);
    }
  };

  const deleteUser = (e) => {
    e.preventDefault();
    const spanElement = e.target.parentElement.querySelector("span[data-name]");
    const userid = spanElement.dataset.name;
    devLog("deleteUser", userid);
    const formData = new FormData();
    formData.append("apitype", "delete_user");
    formData.append("userid", userid);
    try {
      fetch("/api/admin/delete", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setUserData((prevUsers) => prevUsers.filter((user) => user.userid !== userid));
          devLog("deleteUser success : ", data, userid, userdata);
        })
        .catch((error) => console.error("Error:", error));
    } catch (e) {
      console.error("deleteUser error : ", e.message);
    }
  };

  const deleteItem = (e) => {
    const inputElement = e.target.parentElement.querySelector("input");
    const item = inputElement.value;

    // 삭제할 아이템의 인덱스를 찾고 복사본에 반영
    const itemIndex = itemList.indexOf(item);
    if (itemIndex > -1) {
      const itemListCopy = [...itemList];
      itemListCopy.splice(itemIndex, 1); // 아이템 삭제
      setItemList(itemListCopy);
    }
    e.preventDefault();
  };

  const deleteSkill = (e) => {
    e.preventDefault();
    const inputElement = e.target.parentElement.querySelector("input");
    const skill = inputElement.value;

    // 삭제할 아이템의 인덱스를 찾고 복사본에 반영
    const index = skillList.indexOf(skill);
    if (index > -1) {
      const listCopy = [...skillList];
      listCopy.splice(index, 1); // 아이템 삭제
      setSkillList(listCopy);
    }
  };

  // 로그 초기화
  const initLog = (e, page) => {
    e.preventDefault();
    devLog("initLog", page);
    // 서버에 초기화 요청
    const formData = new FormData();
    formData.append("apitype", "delete_log");
    formData.append("userid", selectedUser);
    formData.append("page", page);
    fetch("/api/page", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        devLog("initLog success : ", data, page);
        setNoti(`유저 ${page}로그가 초기화 되었습니다`, data);
        // userdata에 있는 로그 초기화
        const userIndex = userdata.findIndex((user) => user.userid === selectedUser);
        if (userIndex > -1) {
          if (page === "all") userdata[userIndex].logs = [];
          else userdata[userIndex].logs = userdata[userIndex].logs.filter((log) => log.page !== page);
          setUserLog([...userdata[userIndex].logs]);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  async function fetchEssentialData() {
    console.info("ADMIN DATA MANAGEMENT PAGE : 유저관리 항목 선택되었습니다.");
    const inputData = {};
    // 스킬 데이터 가져오기
    const response = await fetch("/api/select?apitype=skill&getcount=1");
    const newData = await response.json();
    // 직업 데이터 가져오기
    const response2 = await fetch("/api/select?apitype=job&getcount=1");
    const newData2 = await response2.json();

    // 아이템 전부 가져오기
    const response3 = await fetch("/api/select?apitype=item&getcount=1");
    const newData3 = await response3.json();

    if (newData?.data) {
      setAllSkills(newData.data);
      devLog("essential data fetch skill : ", newData);
      inputData.skill = ["", ...newData.data.map((data) => data.skill_name)];
    }
    if (newData2?.data) {
      inputData.job = ["", ...newData2.data.map((data) => data.job_name)];
      inputData.jobs = newData2.data;
    }
    setCheckboxOptionList(inputData);
    if (newData3?.data) setAllItems(newData3.data);

    devLog("essential data fetch user : ", newData, newData2, inputData, newData3);
  }

  // 데이터를 주기적으로 가져오기 위한 함수
  async function fetchUserData() {
    let response;
    if (fetchIndex++ == 0) response = await fetch("/api/select?apitype=user&apioption=admin&getcount=1");
    else response = await fetch("/api/select?apitype=user&apioption=admin");
    const newData = await response.json();
    if (newData?.data?.length) {
      devLog(`admin page data 갱신되었습니다(${fetchIndex}): `, newData);
      setUserData([...newData.data]);
    }
    // devLog(`${fetchIndex} user admin page data : `, newData);
  }

  // 최초 데이터 빠르게 가져오기 위한 useEffect
  useEffect(() => {
    fetchEssentialData();
    fetchUserData();
    const intervalId = setInterval(fetchUserData, 5 * 1000);
    // 컴포넌트가 언마운트될 때 clearInterval로 인터벌 해제
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex w-full">
      <div className="w-2/12 flex flex-col mr-3 h-screen overflow-y-auto">
        <h3 className="text-center font-bold text-2xl">유저리스트</h3>
        <div className="flex flex-wrap w-full row-gap-0 h-fit bg-slate-100 max-h-screen overflow-y-auto">
          {Object.keys(userdata).map((key, index) => {
            if (userdata[key]["userid"]) {
              return (
                <Tooltip key={index} content={null} css={"w-full"}>
                  <ListItemIndex index={index} label={userdata[key]["userid"]} onclick={clickUser} deleteButton={true} deleteFunc={deleteUser} alignDir={"left"} />
                </Tooltip>
              );
            }
          })}
        </div>
      </div>
      <div className="w-7/12 flex flex-col user-form">
        {/* <h3 className="text-center">유저리스트</h3> */}
        <form onSubmit={handleSubmitUser} className="grid grid-cols-12 gap-1 shadow sm:overflow-hidden sm:rounded-md p-4 bg-slate-100 w-full" style={{minHeight: "400px"}} data-apitype="update_user">
          <GridInputSelectBox label={"유저권한"} id={"role"} colSpan={3} options={["user", "admin"]} />
          <div className="col-span-full" />
          <MakeInputList inputNameObjects={userinputNames} checkboxOptionObjects={checkboxOptionList} />
          <div className="relative col-span-12 mt-4 flex gap-1">
            {[
              ["두상", clickUserImage?.[0] || false],
              ["전신", clickUserImage?.[1] || false],
              ["마스코트", clickUserImage?.[2] || false],
            ].map((data, index) => {
              // devLog(data, data[1] ? null : "Drag Or Click");
              return (
                <div className="block w-1/4" key={index}>
                  <label htmlFor={`user_img_${index}`} className="block text-sm font-medium text-gray-700 row">
                    {data[0]}
                  </label>
                  <FileDragAndDrop css={"mt-2 w-full col-span-4 h-[200px]"} id={`user_img_${index}`} type={"image/"} text={data[1] ? null : "Drag Or Click"} image={getImageUrl(data[1])} objectFit={"fill"} extFunc={imgInitFn} />
                </div>
              );
            })}
          </div>
          <div className="relative col-span-12 mt-4 flex gap-1">
            <div className="block w-1/2">
              <label htmlFor={`user_img_3`} className="block text-sm font-medium text-gray-700 row">
                레이드 이미지
              </label>
              <FileDragAndDrop
                css={"mt-2 w-full col-span-12 h-[200px]"}
                id={`user_img_3`}
                type={"image/"}
                text={clickUserImage?.[3] ? null : "Drag Or Click"}
                image={getImageUrl(clickUserImage?.[3] || null)}
                objectFit={"fill"}
                extFunc={imgInitFn}
              />
            </div>
            <div className="block w-1/2">
              <label htmlFor={`user_img_3`} className="block text-sm font-medium text-gray-700 row">
                궁극기 이미지
              </label>
              <FileDragAndDrop
                css={"mt-2 w-full col-span-12 h-[200px]"}
                id={`user_img_4`}
                type={"image/"}
                text={clickUserImage?.[4] ? null : "Drag Or Click"}
                image={getImageUrl(clickUserImage?.[4] || null)}
                objectFit={"fill"}
                extFunc={imgInitFn}
              />
            </div>
          </div>
          <div className="relative col-span-12 mt-4 user-itemlist">
            <h3 className="text-center font-bold text-2xl">유저 아이템 리스트</h3>
            <div className="flex flex-wrap w-full row-gap-0 min-h-10 h-fit bg-slate-100">
              {itemList &&
                itemList.map((item, index) => (
                  <Tooltip key={`${item}-${index}`} content={<span>이것은 테스트 툴팁입니다!</span>} css={"w-1/6"}>
                    <InputTextList nolabel={true} readonly={true} default={item} id={`user_item_${index}`} type={"text"} css={"text-center border"} deleteButton={true} deleteFunc={deleteItem} />
                  </Tooltip>
                ))}
            </div>
          </div>
          <div className="relative col-span-12 mt-4 user-itemlist">
            <h3 className="text-center font-bold text-2xl">유저 스킬 리스트</h3>
            <div className="flex flex-wrap w-full row-gap-0 min-h-10 h-fit bg-slate-100">
              {skillList &&
                skillList.map((skill, index) => (
                  <Tooltip key={`${skill}-${index}`} content={<span>이것은 테스트 툴팁입니다!</span>} css={"w-1/6"}>
                    {/* prettier-ignore */}
                    <InputTextList nolabel={true} readonly={true} default={skill} id={`user_skillList_${index}`} type={"text"} css={"text-center border"} deleteButton={true} deleteFunc={deleteSkill} />
                  </Tooltip>
                ))}
            </div>
          </div>
          <GridInputButton colSpan={12} label={"submit"} type="submit" />
        </form>
        <div className="flex flex-wrap w-full row-gap-0 min-h-10 h-fit bg-slate-100 items-center justify-center">
          <h3 className="text-center font-bold text-2xl mr-4">유저 아이템 추가</h3>
          <GridInputText nolabel={true} id={"user_item_add"} type={"text"} css={"text-center border"} />
          <GridInputButton label={"추가"} type={"button"} onclick={addItem} />
        </div>
        <div className="flex flex-wrap w-full row-gap-0 min-h-10 h-fit bg-slate-100 items-center justify-center">
          <h3 className="text-center font-bold text-2xl mr-4">유저 스킬 추가</h3>
          <GridInputText nolabel={true} id={"user_skillList_add"} type={"text"} css={"text-center border"} />
          <GridInputButton label={"추가"} type={"button"} onclick={addSkill} />
        </div>
      </div>
      <div className="w-3/12 flex flex-col mr-3">
        <h3 className="text-center font-bold text-2xl">유저로그</h3>
        <UserLogViewer logs={userLog} onInitButton={initLog} />
      </div>
      <Autocomplete id={"#user_item_add"} data={allItems} autokey={"item_name"} />
      <Autocomplete id={"#user_skillList_add"} data={allSkills} autokey={"skill_name"} />
      {noti && <NotificationModal message={noti} onClose={() => setNoti(null)} />}
    </div>
  );
}
