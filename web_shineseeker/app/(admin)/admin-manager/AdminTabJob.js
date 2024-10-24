"use client";
import {updateDataWithFormInputs} from "/_custom/scripts/client";
import React, {useState, useEffect} from "react";
import {devLog} from "@/_custom/scripts/common";
import ListItemIndex from "/_custom/components/_common/ListItemIndex";
import GridInputButton from "/_custom/components/_common/grid/GridInputButton";
import GridInputText from "/_custom/components/_common/grid/GridInputText";
import GridInputTextArea from "/_custom/components/_common/grid/GridInputTextArea";
import GridInputSelectBox from "/_custom/components/_common/grid/GridInputSelectBox";
import FileDragAndDrop from "/_custom/components/_common/FileDragAndDrop";
import Tooltip from "@/_custom/components/_common/Tooltip";
import MakeInputList from "./MakeInputList";

const menuName = "job";
export default function Home() {
  const [maindata, setMainData] = useState([]);
  const [clickImage, setClickImage] = useState([]);
  const [jobList, setJobList] = useState([]);
  let fetchIndex = 0;

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
    updateDataWithFormInputs(e, apitype, "upload", addObject, true);
  };

  const addItem = (e) => {
    const item = document.querySelector("#job_skill_add").value;
    if (item) {
      setJobList([...jobList, item]);
    }
  };

  const clickListItem = (e) => {
    const name = e.target.dataset.name;
    const listIndex = e.target.dataset.index;
    const data = maindata?.[listIndex];
    devLog("clickListItem", jobList, maindata);
    if (data) {
      // 1. 일반 input 값 채우기
      const updataFormInputList = document.querySelectorAll(`.${menuName}-form form input`);
      devLog("clickUser", name, data, clickImage);

      updataFormInputList.forEach((input) => {
        if (input.id.startsWith(`${menuName}_img_`) || input.id.startsWith(`${menuName}_detail_`)) return; // 특수 input은 제외
        try {
          input.value = data[input.id] || "init";
        } catch (e) {
          console.error(input, e);
        }
      });
      // 2. 이미지 채우기
      setClickImage([data[`${menuName}_img_0`], data[`${menuName}_img_1`]]);
      // 3. 사용효과(select) 채우기
      const selectElements = document.querySelectorAll(`.${menuName}-form form select`);
      selectElements.forEach((select) => {
        select.value = data[select.id];
      });
      // textarea 채우기
      const textareaElements = document.querySelectorAll(`.${menuName}-form form textarea`);
      textareaElements.forEach((textarea) => {
        textarea.value = data[textarea.id];
      });
      //4.직업 스킬 채우기
      setJobList([...data.job_skill]);
    }
  };
  async function fetchEssentialData() {
    console.info("ADMIN DATA MANAGEMENT PAGE : 스킬 항목 선택되었습니다.");
    const response = await fetch("/api/select?apitype=skill_detail&getcount=1");
    const newData = await response.json();
    if (newData?.data?.length) {
      // 스킬 상세정보를 input과 select에 넣기
      const skillList = {};
      for (const key of Object.keys(newData.data[0])) {
        if (key.startsWith("updated")) continue;
        document.querySelector(`#${key}`).value = newData.data[0][key]; // input에 기본값 넣기
        let id = key.replace("_detail", "");
        skillList[id] = newData.data[0][key].split(",");
      }
      setSkillList({...skillList});
    }
    console.log("essential data skill detail: ", newData);
  }

  // 데이터를 주기적으로 가져오기 위한 함수
  async function fetchData() {
    let response;
    if (fetchIndex++ == 0) response = await fetch(`/api/select?apitype=${menuName}&getcount=1`);
    else response = await fetch(`/api/select?apitype=${menuName}`);
    const newData = await response.json();
    if (newData?.data?.length) {
      devLog(`admin *** ${menuName} *** page data 갱신되었습니다(${fetchIndex}): `, newData);
      setMainData([...newData.data]);
    }
  }

  // 최초 데이터 빠르게 가져오기 위한 useEffect
  useEffect(() => {
    // fetchEssentialData();
    fetchData();
    const intervalId = setInterval(fetchData, 10 * 1000);
    // 컴포넌트가 언마운트될 때 clearInterval로 인터벌 해제
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex w-full">
      <div className="w-1/5 flex flex-col mr-3 ">
        <h3 className="text-center font-bold text-2xl">직업리스트</h3>
        <div className="flex flex-wrap w-full row-gap-0 h-fit bg-slate-100">
          {Object.keys(maindata).map((key, index) => {
            if (maindata[key]["job_name"]) {
              return (
                <Tooltip key={index} content={null} css={"w-full"}>
                  <ListItemIndex label={maindata[key]["job_name"]} onclick={clickListItem} />
                </Tooltip>
              );
            }
          })}
        </div>
      </div>
      <div className={`w-4/5 flex flex-col ${menuName}-form`}>
        <form onSubmit={handleSubmitUser} data-apitype={`update_${menuName}`} className="grid grid-cols-12 gap-1 shadow sm:overflow-hidden sm:rounded-md p-4 bg-slate-100 w-full" style={{minHeight: "400px"}}>
          <div className="relative col-span-12 mt-4 flex gap-1">
            {[["상징 아이콘", clickImage?.[0] || false]].map((data, index) =>
              //prettier-ignore
              <div className="block w-1/4" key={index}>
                <label htmlFor={`job_img_${index}`} className="block text-2xl font-bold">{data[0]}</label>
                <FileDragAndDrop css={"mt-2 w-full col-span-4 h-[200px]"} id={`job_img_${index}`} type={"image/"} text={data[1] ? null : "Drag Or Click"} image={data[1]} objectFit={"fill"} />
              </div>
            )}
          </div>
          <MakeInputList inputNameObjects={inputNames} />
          <div className="relative col-span-12 job-skill-list">
            <h1 className="mt-8 font-bold text-2xl">습득가능스펠</h1>
            <div className="flex flex-wrap w-full row-gap-0 min-h-10 h-fit bg-slate-100">
              {jobList.map((item, index) => (
                <Tooltip key={index} content={<span>이것은 테스트 툴팁입니다!</span>} css={"w-1/6"}>
                  <GridInputText nolabel={true} readonly={true} default={item} id={`job_skill_${index}`} type={"text"} css={"text-center border"} />
                </Tooltip>
              ))}
            </div>
          </div>
          <GridInputButton colSpan={12} label={"submit"} type="submit" />
        </form>
        <div className="flex flex-wrap w-full row-gap-0 min-h-10 h-fit bg-slate-100">
          <h3 className="text-center font-bold text-2xl mr-4">스킬 직업 추가 - 미완성</h3>
          <GridInputText nolabel={true} id={"job_skill_add"} type={"text"} css={"text-center border"} />
          <GridInputButton label={"추가"} type={"button"} onclick={addItem} />
        </div>
      </div>
    </div>
  );
}

// ** id에 하이푼(-) 대신 언더바(_) 사용할 것 (sql 컬럼명과 동일하게)
const inputNames = [
  {header: "일반 설정", label: "직업 이름", id: "job_name", colSpan: 6},
  {header: "기초스테이터스", label: "HP", id: "job_hp", type: "number", colSpan: 2},
  {label: "ATK", id: "job_atk", type: "number", colSpan: 2},
  {label: "DEF", id: "job_def", type: "number", colSpan: 2},
  {label: "WIS", id: "job_wis", type: "number", colSpan: 2},
  {label: "AGI", id: "job_agi", type: "number", colSpan: 2},
  {label: "LUK", id: "job_luk", type: "number", colSpan: 2},
];
