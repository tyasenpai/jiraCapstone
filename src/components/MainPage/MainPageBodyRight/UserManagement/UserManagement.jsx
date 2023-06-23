import React, { useRef, useState, useEffect } from "react";
import {
  apiDeleteUser,
  apiGetUser,
  apiSignup,
  apiUpdateUser,
} from "../../../../apis/userAPI";
import { useForm } from "react-hook-form";
import {
  Container,
  Row,
  Col,
  Modal,
  Button,
  Form,
  Pagination,
} from "react-bootstrap";
import style from "./UserManagement.module.scss";
import Table from "react-bootstrap/Table";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import * as yup from "yup";

const schema = yup.object({
  email: yup.string().email().required("email không được để trống"),
  passWord: yup.string().required("Mật khẩu không được để trống"),
  name: yup.string().required("Tên không được để trống"),
  phoneNumber: yup.number().required("Số điện thoại không được để trống"),
});

function UserManagement() {
  const [listUser, setListUser] = useState([]);
  const [updateUser, setUpdatetUser] = useState({});
  const [foundUser, setFoundUser] = useState([]);
  const [page, setPage] = useState(1);
  const [show, setShow] = useState(false);
  const [showFix, setShowFix] = useState(false);
  const handleClose = () => setShow(false);
  const handleCloseFix = () => setShowFix(false);
  const handleShow = () => setShow(true);
  const handleChooseUser = (item) => {
    setShowFix(true);
    const clickedUser = listUser.find((user) => user.userId === item.userId);
    setUpdatetUser(clickedUser);
    console.log(clickedUser);
    getListUsers();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // declare initial value for inputs
    defaultValues: {
      passWord: "",
      email: "",
      name: "",
      phoneNumber: "",
    },
    mode: "onTouched",
    // Khai báo schema validation bằng yup
    resolver: yupResolver(schema),
  });

  const [errorSignUp, setErrorSignUp] = useState("");
  const navigate = useNavigate();

  const onAddUser = async (value) => {
    console.log("value", value);
    try {
      await apiSignup(value);
    } catch (error) {
      setErrorSignUp(error);
      console.log(error);
    }
    getListUsers();
    handleClose();
  };

  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef();
  const timeoutRef = useRef();

  useEffect(() => {
    console.log(inputRef.current);
    inputRef.current.focus();
  }, []);

  const handleDelete = async (item) => {
    try {
      const id = parseInt(item.userId);
      const data = await apiDeleteUser(id);
    } catch (error) {
      console.log(error);
    }
    getListUsers();
  };

  const onUpdate = async (value) => {
    const payload = { ...value, id: updateUser.userId };
    console.log(payload);
    try {
      const data = await apiUpdateUser(payload);
    } catch (error) {
      console.log(error);
    }
    getListUsers();
    setShowFix(false);
  };
  const handlePage = (item) => {
    setPage(item);
  };

  const handleSearch = (evt) => {
    setSearchTerm(evt.target.value);
    const searchUser = listUser.filter((user) => {
      const search = searchTerm.toLowerCase();
      let findUser = user.name.toLowerCase();
      return findUser.indexOf(search) !== -1;
    });
    clearTimeout(timeoutRef.current);
    setFoundUser(searchUser);
    getListUsers();
  };

  const getListUsers = async () => {
    try {
      const data = await apiGetUser();
      if (searchTerm !== "") {
        setListUser(foundUser);
      } else {
        setListUser(data.content);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getListUsers();
  }, [foundUser]);
  return (
    <div className={style.container}>
      <div>
        <h1 className="text-center text-dark">Quản lý người dùng</h1>
      </div>
      <div>
        <Button onClick={handleShow} className="mt-5">
          Thêm người dùng
        </Button>

        <Modal className="Modal-background" show={show} onHide={handleClose}>
          <Modal.Header className="text-dark">
            <Modal.Title>Thêm người dùng</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridEmail">
                  <Form.Label className={style.label}>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    {...register("email")}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridEmail">
                  <Form.Label className={style.label}>Mật Khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Mật Khẩu"
                    {...register("passWord")}
                  />
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridEmail">
                  <Form.Label className={style.label}>Tên Tài Khoản</Form.Label>
                  <Form.Control placeholder="Name" {...register("name")} />
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridEmail">
                  <Form.Label className={style.label}>Số Điện Thoại</Form.Label>
                  <Form.Control
                    type="phone"
                    placeholder="phone"
                    {...register("phoneNumber")}
                  />
                </Form.Group>
              </Row>
              {errorSignUp && (
                <Alert className="mb-3" severity="error">
                  Tài khoản đã được tồn tại !!
                </Alert>
              )}
            </Form>{" "}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleSubmit(onAddUser)}>Thêm người dùng</Button>
            <Button onClick={handleClose}>Đóng</Button>
          </Modal.Footer>
        </Modal>
      </div>
      <div>
        <input
          ref={inputRef}
          placeholder="Tìm kiếm"
          className={`${style.timkiem} mt-5`}
          value={searchTerm}
          onChange={handleSearch}
        ></input>
      </div>
      <div className="mt-4">
        <Table bordered hover>
          <thead>
            <tr className="text-dark text-center">
              <th>STT</th>
              <th>User Id</th>
              <th>Email</th>
              <th>Name</th>
              <th>SĐT</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listUser.map((item, index) => {
              if (page === 1) {
                if (index < 10) {
                  return (
                    <tr className="text-dark text-center" key={index}>
                      <td>{index + 1}</td>
                      <td>{item.userId}</td>
                      <td>{item.email}</td>
                      <td>{item.name}</td>
                      <td>{item.phoneNumber}</td>
                      <td>
                        <Button
                          onClick={() => {
                            handleChooseUser(item);
                          }}
                        >
                          Sửa
                        </Button>
                      </td>
                      <td>
                        <Button onClick={() => handleDelete(item)}>Xóa</Button>
                      </td>
                    </tr>
                  );
                }
              } else if (page === 2) {
                if (index >= 10 && index < 20) {
                  return (
                    <tr className="text-dark text-center" key={index}>
                      <td>{index + 1}</td>
                      <td>{item.userId}</td>
                      <td>{item.email}</td>
                      <td>{item.name}</td>
                      <td>{item.phoneNumber}</td>
                      <td>
                        <Button
                          onClick={() => {
                            handleChooseUser(item);
                          }}
                        >
                          Sửa
                        </Button>
                      </td>
                      <td>
                        <Button onClick={() => handleDelete(item)}>Xóa</Button>
                      </td>
                    </tr>
                  );
                }
              } else if (page === 3) {
                if (index >= 20 && index < 30) {
                  return (
                    <tr className="text-dark text-center" key={index}>
                      <td>{index + 1}</td>
                      <td>{item.userId}</td>
                      <td>{item.email}</td>
                      <td>{item.name}</td>
                      <td>{item.phoneNumber}</td>
                      <td>
                        <Button
                          onClick={() => {
                            handleChooseUser(item);
                          }}
                        >
                          Sửa
                        </Button>
                      </td>
                      <td>
                        <Button onClick={() => handleDelete(item)}>Xóa</Button>
                      </td>
                    </tr>
                  );
                }
              } else if (page === 4) {
                if (index >= 30 && index < 40) {
                  return (
                    <tr className="text-dark text-center" key={index}>
                      <td>{index + 1}</td>
                      <td>{item.userId}</td>
                      <td>{item.email}</td>
                      <td>{item.name}</td>
                      <td>{item.phoneNumber}</td>
                      <td>
                        <Button
                          onClick={() => {
                            handleChooseUser(item);
                          }}
                        >
                          Sửa
                        </Button>
                      </td>
                      <td>
                        <Button onClick={() => handleDelete(item)}>Xóa</Button>
                      </td>
                    </tr>
                  );
                }
              } else if (page === 5) {
                if (index >= 40 && index < 50) {
                  return (
                    <tr className="text-dark text-center" key={index}>
                      <td>{index + 1}</td>
                      <td>{item.userId}</td>
                      <td>{item.email}</td>
                      <td>{item.name}</td>
                      <td>{item.phoneNumber}</td>
                      <td>
                        <Button
                          onClick={() => {
                            handleChooseUser(item);
                          }}
                        >
                          Sửa
                        </Button>
                      </td>
                      <td>
                        <Button onClick={() => handleDelete(item)}>Xóa</Button>
                      </td>
                    </tr>
                  );
                }
              } else if (page === 6) {
                if (index >= 50 && index < 60) {
                  return (
                    <tr className="text-dark text-center" key={index}>
                      <td>{index + 1}</td>
                      <td>{item.userId}</td>
                      <td>{item.email}</td>
                      <td>{item.name}</td>
                      <td>{item.phoneNumber}</td>
                      <td>
                        <Button
                          onClick={() => {
                            handleChooseUser(item);
                          }}
                        >
                          Sửa
                        </Button>
                      </td>
                      <td>
                        <Button onClick={() => handleDelete(item)}>Xóa</Button>
                      </td>
                    </tr>
                  );
                }
              } else if (page === 7) {
                if (index >= 60 && index < 70) {
                  return (
                    <tr className="text-dark text-center" key={index}>
                      <td>{index + 1}</td>
                      <td>{item.userId}</td>
                      <td>{item.email}</td>
                      <td>{item.name}</td>
                      <td>{item.phoneNumber}</td>
                      <td>
                        <Button
                          onClick={() => {
                            handleChooseUser(item);
                          }}
                        >
                          Sửa
                        </Button>
                      </td>
                      <td>
                        <Button onClick={() => handleDelete(item)}>Xóa</Button>
                      </td>
                    </tr>
                  );
                }
              }
            })}
          </tbody>
          <Modal
            className="Modal-background"
            show={showFix}
            onHide={handleCloseFix}
          >
            <Modal.Header className="text-dark">
              <Modal.Title>Sửa thông tin người dùng</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label className={style.label}>id</Form.Label>
                    <Form.Control placeholder="id" value={updateUser.userId} />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label className={style.label}>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder={updateUser.email}
                      {...register("email")}
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label className={style.label}>Mật Khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      {...register("passWord")}
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label className={style.label}>
                      Tên Tài Khoản
                    </Form.Label>
                    <Form.Control
                      placeholder={updateUser.name}
                      {...register("name")}
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Label className={style.label}>
                      Số Điện Thoại
                    </Form.Label>
                    <Form.Control
                      type="phone"
                      placeholder={updateUser.phoneNumber}
                      {...register("phoneNumber")}
                    />
                  </Form.Group>
                </Row>
                {errorSignUp && (
                  <Alert className="mb-3" severity="error">
                    Tài khoản đã được tồn tại !!
                  </Alert>
                )}
              </Form>{" "}
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleSubmit(onUpdate)} type="submit">
                Cập nhật
              </Button>
              <Button onClick={handleCloseFix}>Đóng</Button>
            </Modal.Footer>
          </Modal>
        </Table>
      </div>

      <Pagination>
        <Pagination.Ellipsis />
        <Pagination.Prev />
        <Pagination.Item
          onClick={() => {
            handlePage(1);
          }}
          active={page === 1 ? 1 : ""}
        >
          {1}
        </Pagination.Item>
        <Pagination.Item
          onClick={() => {
            handlePage(2);
          }}
          active={page === 2 ? 2 : ""}
        >
          {2}
        </Pagination.Item>
        <Pagination.Item
          onClick={() => {
            handlePage(3);
          }}
          active={page === 3 ? 3 : ""}
        >
          {3}
        </Pagination.Item>
        <Pagination.Item
          onClick={() => {
            handlePage(4);
          }}
          active={page === 4 ? 4 : ""}
        >
          {4}
        </Pagination.Item>
        <Pagination.Item
          onClick={() => {
            handlePage(5);
          }}
          active={page === 5 ? 5 : ""}
        >
          {5}
        </Pagination.Item>
        <Pagination.Item
          onClick={() => {
            handlePage(6);
          }}
          active={page === 6 ? 6 : ""}
        >
          {6}
        </Pagination.Item>
        <Pagination.Item
          onClick={() => {
            handlePage(7);
          }}
          active={page === 7 ? 7 : ""}
        >
          {7}
        </Pagination.Item>
        <Pagination.Item
          onClick={() => {
            handlePage(8);
          }}
          active={page === 8 ? 8 : ""}
        >
          {8}
        </Pagination.Item>
        <Pagination.Next />
        <Pagination.Ellipsis />
      </Pagination>
    </div>
  );
}
export default UserManagement;
