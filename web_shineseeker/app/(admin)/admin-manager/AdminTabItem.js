"use client";
import {updateDataWithFormInputs} from "/_custom/scripts/client";
import React, {useState, useEffect} from "react";
import {devLog} from "@/_custom/scripts/common";
import ListItemIndex from "/_custom/components/_common/ListItemIndex";
import GridInputButton from "/_custom/components/_common/grid/GridInputButton";
import GridInputText from "/_custom/components/_common/grid/GridInputText";
import MakeInputList from "./MakeInputList";
import FileDragAndDrop from "/_custom/components/_common/FileDragAndDrop";
import Tooltip from "@/_custom/components/_common/Tooltip";

const menuName = "item";
export default function Home() {
  const [maindata, setMainData] = useState([]);
  const [clickImage, setClickImage] = useState([]);
  const [itemOptionList, setItemOptionList] = useState({});

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
    devLog("clickListItem", itemOptionList, maindata);
    if (data) {
      // 1. 일반 input 값 채우기
      const updataFormInputList = document.querySelectorAll(`.${menuName}-form form input`);
      devLog("clickUser", name, data, clickImage);

      updataFormInputList.forEach((input) => {
        if (input.id.startsWith(`${menuName}_img_`) || input.id.startsWith(`${menuName}_detail_`)) return; // 특수 input은 제외
        try {
          input.value = data[input.id];
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
    }
  };

  async function fetchEssentialData() {
    console.info("ADMIN DATA MANAGEMENT PAGE : 아이템 항목 선택되었습니다.");
    const response = await fetch("/api/select?apitype=item_option&getcount=1");
    const newData = await response.json();
    if (newData?.data?.length) {
      // 아이템 상세정보를 input과 select에 넣기
      const itemOptionList = {};
      for (const key of Object.keys(newData.data[0])) {
        if (key.startsWith("updated")) continue;
        document.querySelector(`#${key}`).value = newData.data[0][key]; // input에 기본값 넣기
        let id = key.replace("_option", "");
        itemOptionList[id] = newData.data[0][key].split(",");
      }
      setItemOptionList({...itemOptionList});
    }
    console.log("essential data item detail: ", newData);
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
        <h3 className="text-center font-bold text-2xl">아이템리스트</h3>
        <div className="flex flex-wrap w-full row-gap-0 h-fit bg-slate-100">
          {Object.keys(maindata).map((key, index) => {
            if (maindata[key]["item_name"]) {
              return (
                <Tooltip key={index} content={<span>{maindata[key]["item_desc"]}</span>} css={"w-full"}>
                  <ListItemIndex label={maindata[key]["item_name"]} onclick={clickListItem} />
                </Tooltip>
              );
            }
          })}
        </div>
      </div>
      <div className={`w-4/5 flex flex-col ${menuName}-form`}>
        {/* prettier-ignore */}
        <form onSubmit={handleSubmitUser} data-apitype={`update_${menuName}`} className="grid grid-cols-12 gap-1 shadow sm:overflow-hidden sm:rounded-md p-4 bg-slate-100 w-full" style={{minHeight: "400px"}}>
          <div className="relative col-span-12 mt-4 flex gap-1">
            {[
              ["아이템 이미지", clickImage?.[0] || false],
            ].map((data, index) =>
              //prettier-ignore
              <div className="block w-1/4" key={index}>
                <label htmlFor="item_icon" className="block text-2xl font-bold">{data[0]}</label>
                <FileDragAndDrop css={"mt-2 w-full col-span-4 h-[200px]"} id={`item_img_${index}`} type={"image/"} text={data[1] ? null : "Drag Or Click"} image={data[1]} objectFit={"fill"} />
              </div>
            )}
          </div>
          <MakeInputList inputNameObjects={inputNames} checkboxOptionObjects={ Object.keys(itemOptionList).length ? itemOptionList : itemDefaultList} />
          <h1 className="mt-8 col-span-full font-bold text-2xl">아이템 사용효과 리스트 입력칸 ( 구분자 &apos;,&apos; 로 해주세요 )</h1>
          <GridInputText label={"아이템 유형"} id={"item_option_type"} type={"text"} colSpan={12} default={itemDefaultList.item_option_type.join(',') } css="border-b" />
          <GridInputText label={"추가 능력치"} id={"item_option_addstat"} type={"text"} colSpan={12} default={itemDefaultList.item_option_addstat.join(',')} css="border-b" />
          <GridInputButton colSpan={12} label={"submit"} type="submit" />
        </form>
      </div>
    </div>
  );
}

const itemDefaultList = {
  item_option_type: ["성장재료", "이벤트", "우편"],
  item_option_consumable: ["O", "X"],
  item_option_addstat: ["HP", "ATK", "DEF", "WIS", "AGI", "LUK"],
  item_option_msg: ["X", "O"],
};
// ** id에 하이푼(-) 대신 언더바(_) 사용할 것 (sql 컬럼명과 동일하게)
const inputNames = [
  {header: "일반 설정", label: "아이템이름", id: "item_name", colSpan: 6},
  {label: "설명", id: "item_desc", inputType: "textarea", colSpan: 12},
  {header: "사용효과", label: "유형", id: "item_type", inputType: "checkbox", class: "item_option_type", colSpan: 2},
  {label: "가격", id: "item_cost", type: "number", class: "item", css: " h-[36px]", colSpan: 2},
  {label: "소모품여부", id: "item_consumable", inputType: "checkbox", class: "item_option_consumable", colSpan: 2},
  {label: "추가능력치", id: "item_addstat", inputType: "checkbox", class: "item_option_addstat", colSpan: 2},
  {label: "증가최소수치", id: "item_statmin", type: "number", css: " h-[36px]", colSpan: 2},
  {label: "증가최대수치", id: "item_statmax", type: "number", css: " h-[36px]", colSpan: 2},
  {label: "메세지기능", id: "item_msg", inputType: "checkbox", class: "item_option_msg", colSpan: 2},
];