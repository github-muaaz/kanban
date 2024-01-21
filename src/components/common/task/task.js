import styled from "styled-components";
import React, {useContext, useEffect, useState} from "react";
import ModalContext from "../../../context/modalContext";
import Text from "../element/text";
import Span from "../element/text/span";
import Icon from "../element/icon/icon-img";
import MenuSvg from "../../../assets/icons/menu-dots.svg";
import SubtaskBox from "./subtaskBox";
import Select from "../element/form/select";
import TaskForm from "./taskForm";
import BoardContext from "../../../context/boardContext";
import {Draggable} from "react-beautiful-dnd";
import {getBoardStatuses, getTask, setTaskStatus} from "../../../utils/fake";
import axios from "axios";
import config from "../../../config.json";
import {toast} from "react-toastify";

const TaskStyled = styled.div`
  padding: 23px 16px;
  border-radius: 8px;
  background: var(--white, #FFF);
  box-shadow: 0 4px 6px 0 rgba(54, 78, 126, 0.10);
  cursor: pointer;
  gap: 8px;
`

const Task = ({task, index}) => {

    const modalContext = useContext(ModalContext);

    const openModal = () => {
        modalContext.setModalItem(task);
        modalContext.setModal(ModalContainer);
    }

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided) => (
                <TaskStyled
                    className={"flex--column"}
                    onClick={openModal}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <Text content={task.title} fs={'15px'}/>

                    {
                        task.subtasksLength <= 0
                            ? <Span content={`No subtasks`}/>
                            : <Span content={`${task.completedSubtasks} of ${task.subtasksLength} subtasks`}/>
                    }
                </TaskStyled>
            )}
        </Draggable>
    )
}

const ModalContainer = () => {
    return (
        <ModalBody/>
    )
}

const ModalBody = () => {
    const modalContext = useContext(ModalContext);
    const boardContext = useContext(BoardContext);

    const task = modalContext.getModalItem();

    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        // backend call

        axios.get(config.apiEndpoint + '/task/' + task?.id)
            .then(res => {
                modalContext.setModalItem(res.data.data)
                setStatuses(res.data.data.statuses)
            })
            .catch(err => toast.error(err.message))

        // const task = getTask(modalContext.getModalItem().id);
        // const statuses = getBoardStatuses(task?.boardId);

        // modalContext.setModalItem(task);
        // setStatuses(statuses);
    }, []);

    const handleEdit = () => modalContext
        .setModal(
            <TaskForm
                title={'Edit Task'}
                btnTitle={'Save Changes'}
                defaultValues={task}
                boardId={boardContext.getSelectedBoard()?.id}
            />
        );

    const handleStatusChange = e => {
        const statusId = e.target.value;

        const oldStatusId = task.statusId;

        const newTask = {...task};
        newTask.statusId = statusId;

        modalContext.setModalItem(newTask);

        // backend call
        axios.get(config.apiEndpoint + '/task/' + task.id + '/' + statusId)
            .catch(err => toast.error(err.message))
        // setTaskStatus(task.id, statusId);

        boardContext.updateBoard(newTask, oldStatusId);
    }

    return (
        <React.Fragment>
            <div className={'flex--row align--itm--start justify--s--between g--25'}>
                <Text content={task.title}/>

                <Icon onClick={handleEdit} margin={'10px 0 0 0'} icon={MenuSvg}/>
            </div>

            <Text
                content={task.description}
                fs={'13px'}
                className={'medium--grey font--weight--5 l--height--23'}
            />

            <SubtaskBox task={task} setTask={modalContext.setModalItem}/>

            <Select
                label={'Current Status'}
                onChange={handleStatusChange}
                defaultValue={task.statusId}
                options={statuses}
            />
        </React.Fragment>
    )
}

export default Task;