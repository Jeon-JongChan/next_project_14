"use client";
import {updateDataWithFormInputs} from "/_custom/scripts/client";
import React, {useState, useEffect} from "react";
import {devLog} from "@/_custom/scripts/common";
import ListItemIndex from "/_custom/components/_common/ListItemIndex";
import GridInputButton from "/_custom/components/_common/grid/GridInputButton";
import GridInputText from "/_custom/components/_common/grid/GridInputText";
import GridFile from "/_custom/components/_common/grid/GridFile";
import GridInputSelectBox from "/_custom/components/_common/grid/GridInputSelectBox";
import FileDragAndDrop from "/_custom/components/_common/FileDragAndDrop";
import Tooltip from "@/_custom/components/_common/Tooltip";
import MakeInputList from "../admin-manager/MakeInputList";

const menuName = "main";
export default function Home() {
  const [maindata, setMainData] = useState([]);
  const [clickImage, setClickImage] = useState([]);
  const [skillList, setSkillList] = useState({});
  let fetchIndex = 0;

  /* 입력 Input 조절에 쓰일 state */
  const [slideList, setSlideList] = useState([0, 1]);

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
    updateDataWithFormInputs(e, apitype, "upload-page", addObject, true);
  };

  const manageSlide = (status) => {
    if (status) setSlideList([...slideList, ...Array(status).map((_, index) => slideList.length + index)]);
    else setSlideList(slideList.slice(0, slideList.length - 1));
  };

  const fillNode = () => {
    const name = menuName; // e.target.dataset.name;
    const listIndex = 0;

    maindata.forEach((data) => {
      const element = document.querySelector(`#${data.id}`);

      if (element) {
        if (data.id.startsWith(`${name}_img`)) {
          setClickImage([...clickImage, data.value]);
        } else {
          element.value = data.value;
        }
      }
    }); // forEach와 블록을 올바르게 닫음
  };

  // 데이터를 주기적으로 가져오기 위한 함수
  async function fetchData() {
    let response;
    if (fetchIndex++ == 0) response = await fetch(`/api/select?apitype=page&getcount=1&page_name=${menuName}`);
    else response = await fetch(`/api/select?apitype=page&pagename=${menuName}`);
    const newData = await response.json();
    devLog(`admin *** ${menuName} *** page data(${fetchIndex}): `, newData);
    if (newData?.data?.length) {
      devLog(`admin *** ${menuName} *** page data 갱신되었습니다(${fetchIndex}): `, newData);
      setMainData([...newData.data]);
    }
  }

  // 최초 데이터 빠르게 가져오기 위한 useEffect
  useEffect(() => {
    fetchData();
    fillNode();
    // const intervalId = setInterval(fetchData, 10 * 1000);
    // 컴포넌트가 언마운트될 때 clearInterval로 인터벌 해제
    // return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex w-full">
      <div className={`w-full flex flex-col ${menuName}-form`}>
        <form onSubmit={handleSubmitUser} data-apitype={`update_${menuName}`} className="grid grid-cols-12 gap-1 shadow sm:overflow-hidden sm:rounded-md p-4 bg-slate-100 w-full" style={{minHeight: "400px"}}>
          <h1 className="mt-8 font-bold text-2xl col-span-12">메인 페이지 슬라이드 관리</h1>
          {slideList.map((index) => (
            <FileDragAndDrop
              key={index}
              css={"mt-2 w-full col-span-4 h-[200px]"}
              id={`main_img_slide_${index}`}
              type={"image/"}
              text={clickImage?.[index] ? null : "Drag Or Click"}
              image={clickImage?.[index]}
              objectFit={"fill"}
            />
          ))}
          <div className="col-span-full" />
          <div className="col-span-8" />
          <div className="col-span-4 flex justify-end">
            <GridInputButton colSpan={4} label={"슬라이드 삭제"} type="button" onclick={() => manageSlide(0)} />
            <GridInputButton colSpan={4} label={"슬라이드 추가 생성"} type="button" onclick={() => manageSlide(1)} css="ml-auto" />
          </div>
          <GridInputText label={"유투브 BGM 주소(공유주소x)"} id={"main_youtube"} type={"text"} colSpan={12} default={"https://www.youtube.com/watch?v=ehX7MAhc5iA"} css="border-b" />
          <GridInputButton colSpan={12} label={"submit"} type="submit" />
        </form>
      </div>
    </div>
  );
}
