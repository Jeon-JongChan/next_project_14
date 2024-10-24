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

const menuName = "monster";
export default function Home() {
  const [maindata, setMainData] = useState([]);
  const [clickImage, setClickImage] = useState([]);
  const [skillList, setSkillList] = useState({});
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

  const clickListItem = (e) => {
    const name = e.target.dataset.name;
    const listIndex = e.target.dataset.index;
    const data = maindata?.[listIndex];
    if (data) {
      // 1. 일반 input 값 채우기
      const updataFormInputList = document.querySelectorAll(`.${menuName}-form form input`);
      devLog("clickUser", name, data, clickImage, skillList);

      updataFormInputList.forEach((input) => {
        if (input.id.startsWith(`${menuName}_img_`) || input.id.startsWith(`skill_detail_`)) return; // 특수 input은 제외
        try {
          input.value = data[input.id] || "init";
        } catch (e) {
          console.error(input, e);
        }
      });
      // 2. 이미지 채우기
      setClickImage([data[`${menuName}_img_0`]]);
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
    }
  };
  async function fetchEssentialData() {
    console.info("ADMIN DATA MANAGEMENT PAGE : 몬스터 항목 선택되었습니다.");
    const response = await fetch("/api/select?apitype=skill_detail&getcount=1");
    const newData = await response.json();
    const secondResponse = await fetch("/api/select?apitype=skill&getcount=1");
    const secondNewData = await secondResponse.json();
    if (newData?.data?.length) {
      // 스킬 상세정보를 input과 select에 넣기
      for (const key of Object.keys(newData.data[0])) {
        if (key.startsWith("updated")) continue;
        document.querySelector(`#${key}`).value = newData.data[0][key]; // input에 기본값 넣기
      }
    }
    if (secondNewData?.data?.length) {
      const skillList = {skill: [""]};
      for (const data of secondNewData.data) skillList.skill.push(data.skill_name);
      setSkillList({...skillList});
    }

    console.log(`essential data ${menuName} detail: `, newData);
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
    fetchEssentialData();
    fetchData();
    const intervalId = setInterval(fetchData, 10 * 1000);
    // 컴포넌트가 언마운트될 때 clearInterval로 인터벌 해제
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex w-full">
      <div className="w-1/5 flex flex-col mr-3 ">
        <h3 className="text-center font-bold text-2xl">보스 몬스터 리스트</h3>
        <div className="flex flex-wrap w-full row-gap-0 h-fit bg-slate-100">
          {Object.keys(maindata).map((key, index) => {
            if (maindata[key]["monster_name"]) {
              return (
                <Tooltip key={index} content={null} css={"w-full"}>
                  <ListItemIndex label={maindata[key]["monster_name"]} onclick={clickListItem} />
                </Tooltip>
              );
            }
          })}
        </div>
      </div>
      <div className={`w-4/5 flex flex-col ${menuName}-form`}>
        <form onSubmit={handleSubmitUser} data-apitype={`update_${menuName}`} className="grid grid-cols-12 gap-1 shadow sm:overflow-hidden sm:rounded-md p-4 bg-slate-100 w-full" style={{minHeight: "400px"}}>
          <div className="relative col-span-12 mt-4 flex gap-1">
            {[["보스 이미지", clickImage?.[0] || false]].map((data, index) =>
              //prettier-ignore
              <div className="block w-1/4" key={index}>
                <label htmlFor={`monster_img_${index}`} className="block text-2xl font-bold">{data[0]}</label>
                <FileDragAndDrop css={"mt-2 w-full col-span-4 h-[200px]"} id={`monster_img_${index}`} type={"image/"} text={data[1] ? null : "Drag Or Click"} image={data[1]} objectFit={"fill"} />
              </div>
            )}
          </div>
          <MakeInputList inputNameObjects={inputNames} checkboxOptionObjects={Object.keys(skillList).length ? skillList : null} />
          <div className="relative col-span-12 grid grid-cols-12 job-skill-list">
            <h1 className="mt-8 font-bold text-2xl col-span-12">습득가능스펠</h1>
            {[...Array(5)].map((_, index) => (
              <React.Fragment key={index}>
                <GridInputText label={"계수(% 미만)"} id={`monster_event_rate_${index}`} type={"number"} colSpan={1} css={"text-center border h-[36px]"} />
                <GridInputSelectBox label={"사용스탯"} id={`monster_event_cost_stat_${index}`} type={"number"} colSpan={1} css={"text-center border"} options={skillList?.skill_stat || skillDefaultList.skill_stat} />
                <GridInputSelectBox label={"효과"} id={`monster_event_type_${index}`} type={"number"} colSpan={1} css={"text-center border"} options={skillList?.skill_type || skillDefaultList.skill_type} />
                <GridInputSelectBox label={"범위"} id={`monster_event_range_${index}`} type={"number"} colSpan={1} css={"text-center border"} options={skillList?.skill_range || skillDefaultList.skill_range} />
                <GridInputSelectBox label={"위력스탯"} id={`monster_event_stat_${index}`} type={"number"} colSpan={1} css={"text-center border"} options={skillList?.skill_cost_stat || skillDefaultList.skill_cost_stat} />
                <GridInputText label={"스탯 적용(%)"} id={`monster_event_stat_rate_${index}`} type={"number"} colSpan={1} css={"text-center border h-[36px]"} />
                <GridInputText label={"출력메세지"} id={`monster_event_msg_${index}`} type={"text"} colSpan={6} css={"text-center border h-[36px]"} />
              </React.Fragment>
            ))}
          </div>
          <h1 className="mt-8 col-span-full font-bold text-2xl">이벤트 조건 입력칸 ( 구분자 &apos;,&apos; 로 / 스킬페이지와 연동됨 )</h1>
          <GridInputText label={"효과 유형"} id={"skill_detail_type"} type={"text"} colSpan={12} default={skillDefaultList.skill_type.join(",")} css="border-b" />
          <GridInputText label={"스킬 범위"} id={"skill_detail_range"} type={"text"} colSpan={12} default={skillDefaultList.skill_range.join(",")} css="border-b" />
          <GridInputText label={"위력 능력치"} id={"skill_detail_stat"} type={"text"} colSpan={12} default={skillDefaultList.skill_stat.join(",")} css="border-b" />
          <GridInputText label={"스킬소비항목"} id={"skill_detail_cost"} type={"text"} colSpan={12} default={skillDefaultList.skill_cost_stat.join(",")} css="border-b" />
          <GridInputButton colSpan={12} label={"submit"} type="submit" />
        </form>
      </div>
    </div>
  );
}
const skillDefaultList = {
  skill_type: ["공격", "방어", "회복", "정지", "조정"],
  skill_range: ["자신", "아군", "적", "전체"],
  skill_stat: ["HP", "ATK", "DEF", "WIS", "AGI", "LUK"],
  skill_cost_stat: ["HP", "ATK", "DEF", "WIS", "AGI", "LUK"],
};
// ** id에 하이푼(-) 대신 언더바(_) 사용할 것 (sql 컬럼명과 동일하게)
const inputNames = [
  {header: "일반 설정", label: "보스 이름", id: "monster_name", colSpan: 6},
  {header: "기초스테이터스", label: "HP", id: "monster_hp", type: "number", colSpan: 2},
  {label: "ATK", id: "monster_atk", type: "number", colSpan: 2},
  {label: "DEF", id: "monster_def", type: "number", colSpan: 2},
  {label: "WIS", id: "monster_wis", type: "number", colSpan: 2},
  {label: "AGI", id: "monster_agi", type: "number", colSpan: 2},
  {label: "LUK", id: "monster_luk", type: "number", colSpan: 2},
  {header: "보유스펠(일반공격)", label: "스펠", id: "monster_skill_0", inputType: "checkbox", class: "skill", colSpan: 3},
  {label: "사용확률(%)", id: "monster_skill_rate_0", type: "number", class: "skill", css: " h-[36px]", colSpan: 2},
  {nolabel: true, id: "monster_skill_1", inputType: "checkbox", class: "skill", delimiter: true, colSpan: 3},
  {nolabel: true, id: "monster_skill_rate_1", type: "number", class: "skill", css: " h-[36px]", colSpan: 2},
  {nolabel: true, id: "monster_skill_2", inputType: "checkbox", class: "skill", delimiter: true, colSpan: 3},
  {nolabel: true, id: "monster_skill_rate_2", type: "number", class: "skill", css: " h-[36px]", colSpan: 2},
  {nolabel: true, id: "monster_skill_3", inputType: "checkbox", class: "skill", delimiter: true, colSpan: 3},
  {nolabel: true, id: "monster_skill_rate_3", type: "number", class: "skill", css: " h-[36px]", colSpan: 2},
  {nolabel: true, id: "monster_skill_4", inputType: "checkbox", class: "skill", delimiter: true, colSpan: 3},
  {nolabel: true, id: "monster_skill_rate_4", type: "number", class: "skill", css: " h-[36px]", colSpan: 2},
];
