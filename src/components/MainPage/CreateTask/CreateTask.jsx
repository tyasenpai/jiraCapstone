import React, { useState, useRef, useEffect } from "react";

import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import styles from "./CreateTask.module.scss";
import { apigetProject } from "../../../apis/projectAPI";
import { apiGetUserById, apiGetUser } from "../../../apis/userAPI";
import {
  getPriority,
  getStatus,
  getTaskType,
  getAssignUserTask,
  apiCreateTask,
  getAssignUserProject,
} from "../../../apis/TaskAPI";
import Alert from "@mui/material/Alert";
import { Select, Space, DatePicker, Slider, InputNumber } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import { NewReleases } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";

const schema = yup.object({
  // listUserAsign: yup.string().required("Danh sách user không được để trống"),
  taskName: yup.string().required("task name không được để trống"),
  // description: yup.string().required("mô tả không được để trống"),
  // statusId: yup.number().required("trạng thái không được để trống"),
  // originalEstimate: yup
  //   .number()
  //   .required("thời gian dự kiến không được để trống"),
  // projectId: yup.number().required("dự án không được để trống"),
  // typeId: yup.number().required("loại task không được để trống"),
  // priorityId: yup.number().required("ưu tiên không được để trống"),
});

function CreateTask() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState([]);
  const [status, setStatus] = useState([]);
  const [priority, setPriority] = useState([]);
  const [tasktype, setTaskType] = useState([]);
  const [user, setUser] = useState([]);
  const [inputValue, setInputValue] = useState(1);
  const [userId, setUserId] = useState([]);
  const [projectId, setProjectId] = useState();

  const onChange = () => {
    let Spent = inputSpent.current.value;
    let Timing = inputRemaining.current.value;
    if (Spent !== undefined && Timing !== undefined) {
      let Sum = parseInt(Spent) + parseInt(Timing);
      setInputValue(Sum);
    } else if (Timing !== undefined) {
      setInputValue(Timing);
    } else if (Spent !== undefined) {
      setInputValue(Spent);
    }
  };
  const inputRef = useRef();
  const inputUser = useRef();
  const inputSpent = useRef();
  const inputRemaining = useRef();
  const inputAssign = useRef();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    // declare initial value for inputs
    defaultValues: {
      listUserAsign: [],
      taskName: "",
      description: "",
      statusId: 0,
      originalEstimate: 0,
      // timeTrackingSpent: 0,
      // timeTrackingRemaining: 0,
      projectId: 0,
      typeId: 0,
      priorityId: 0,
    },
    mode: "onTouched",
    // Khai báo schema validation bằng yup
    resolver: yupResolver(schema),
  });
  const getListProject = async () => {
    try {
      const name = "";
      const id = JSON.parse(localStorage.getItem("user"))?.id;
      const data = await apigetProject(name);
      const newData = data?.content.filter((item) => {
        return item.creator.id === id;
      });

      setProjectName(newData);
      let Ref = inputRef.current?.value;
      setProjectId(Ref);
      getListUser(Ref);
    } catch (error) {
      toast.error(error.response.data.content);
    }
  };

  const getListStatus = async () => {
    try {
      const data = await getStatus();
      const newData = data.content;
      setStatus(newData);
    } catch (error) {
      toast.error(error.response.data.content);
    }
  };

  const getListPriority = async () => {
    try {
      const data = await getPriority();
      const newData = data.content;
      setPriority(newData);
    } catch (error) {
      toast.error(error.response.data.content);
    }
  };
  const getListTaskType = async () => {
    try {
      const data = await getTaskType();
      const newData = data.content;
      setTaskType(newData);
    } catch (error) {
      toast.error(error.response.data.content);
    }
  };
  const getListUser = async (ref) => {
    try {
      let memberProjectName = projectName.find((item) => {
        return item.id == ref;
      });
      const haveMembers = memberProjectName?.members;
      if (haveMembers?.length > 0) {
        const data = await apiGetUserById(ref);
        const newData = data.content;
        setUser(newData);
      } else {
        const data = await apiGetUser();
        const newData = data.content;
        setUser(newData);
      }
    } catch (error) {
      toast.error(error.response.data.content);
    }
  };

  const addUserIntoTask = async (value) => {
    try {
      const data = await getAssignUserTask(value);
      const newData = data.content;
      console.log("newData", newData);
    } catch (error) {
      toast.error(error.response.data.content);
    }
  };

  useEffect(() => {
    getListProject();
    getListStatus();
    getListPriority();
    getListTaskType();
  }, []);

  const [errorSignUp, setErrorSignUp] = useState("");
  const onSubmit = async (value) => {
    try {
      const payload = {
        ...value,
        listUserAsign: userId,
        timeTrackingSpent: +inputSpent.current.value,
        timeTrackingRemaining: +inputRemaining.current.value,
        projectId: +projectId,
        typeId: +value.typeId,
        priorityId: +value.priorityId,
        originalEstimate: +value.originalEstimate,
      };
      const data = await apiCreateTask(payload);
      if (data.statusCode === 200) {
        toast.success("Tạo task thành công");
        navigate("/Main");
      }
    } catch (error) {
      setErrorSignUp(error);
      toast.error(error.response.data.content);
    }
  };

  // select antd
  let options = [];

  user?.map((item) => {
    options.push({
      label: item.name,
      value: item.userId,
    });
  });

  const getIdUser = (value) => {
    console.log(value);
    setUserId(value);
  };
  //editor

  const editorRef = useRef(null);
  const handleDescription = () => {
    if (editorRef.current) {
      setValue("description", editorRef.current.getContent());
    }
  };

  return (
    <div className={`${styles.bannerBackGround}`}>
      <Header />
      <ToastContainer />
      <div className={`${styles.feature} `}>
        <h1 className={`${styles.text} text-center mb-4`}>Create Task</h1>
        <Form>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label className={styles.label}>Project</Form.Label>
              <Form.Select
                {...register("projectId")}
                ref={inputRef}
                onChange={getListProject}
              >
                <option value="">Chọn dự án</option>
                {projectName.map((item) => {
                  // console.log(item);
                  return <option value={item.id}>{item.projectName}</option>;
                })}
              </Form.Select>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label className={styles.label}>Task Name</Form.Label>
              <Form.Control placeholder="Task Name" {...register("taskName")} />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label className={styles.label}>Status</Form.Label>
              <Form.Select {...register("statusId")} onChange={getListStatus}>
                <option>Chọn trạng thái</option>
                {status.map((item) => {
                  return (
                    <option value={item.statusId}>{item.statusName}</option>
                  );
                })}
              </Form.Select>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label className={styles.label}>Priority</Form.Label>
              <Form.Select onChange={getListStatus} {...register("priorityId")}>
                <option>Chọn priority</option>
                {priority.map((item) => {
                  return (
                    <option value={item.priorityId}>{item.priority}</option>
                  );
                })}
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label className={styles.label}>Task Type</Form.Label>
              <Form.Select onChange={getListStatus} {...register("typeId")}>
                <option>Chọn Task Type</option>
                {tasktype.map((item) => {
                  return <option value={item.id}>{item.taskType}</option>;
                })}
              </Form.Select>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label className={styles.label}>Assigness</Form.Label>
              <Space
                style={{
                  width: "100%",
                }}
                direction="vertical"
              >
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: "100%",
                  }}
                  placeholder="Assigness"
                  {...register("listUserAsign")}
                  onChange={getIdUser}
                  options={options}
                />
              </Space>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label className={styles.label}>Time tracking</Form.Label>
              <Slider
                min={1}
                max={40}
                value={inputValue !== undefined ? inputValue : 0}
              />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label className={styles.label}>
                Original Estimate
              </Form.Label>
              <Form.Control
                placeholder="Nhập thời gian dự kiến"
                {...register("originalEstimate")}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label className={styles.label}>Time Spent</Form.Label>
              <InputNumber
                min={1}
                max={20}
                ref={inputSpent}
                onChange={onChange}
                className="form-control"
              />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label className={styles.label}>Time Remaining</Form.Label>
              <InputNumber
                min={1}
                max={20}
                ref={inputRemaining}
                onChange={onChange}
                className="form-control"
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formGridEmail"></Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label className="text-dark">Description</Form.Label>
              <Editor
                onInit={(evt, editor) => (editorRef.current = editor)}
                init={{
                  height: 200,
                  menubar: false,
                  plugins: [
                    "advlist autolink lists link image charmap print preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table paste code help wordcount",
                  ],
                  toolbar:
                    "undo redo | formatselect | " +
                    "bold italic backcolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "removeformat | help",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
                placeholder="Description"
                onEditorChange={handleDescription}
                {...register("description")}
              />
            </Form.Group>
          </Row>

          {errorSignUp && (
            <Alert className="mb-3" severity="error">
              Thất Bại !!
            </Alert>
          )}
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            className="btn-lg"
            type="submit"
          >
            Submit
          </Button>
        </Form>{" "}
      </div>
      <Footer />
    </div>
  );
}

export default CreateTask;
