import { downloadICS } from "~/lib/utils";

import { useState } from "react";
import { CalendarMachineContext } from "~/lib/machines/calendarMachine";
import { Message } from "../message";
import TextAreaField from "../ui/text-area";

export const AddCalendar = () => {
  return (
    <div className="flex flex-col  h-[80vh] w-[1024px] items-center gap-8 px-8 py-6 bg-white rounded-xl ">
      <div className="flex flex-col w-full overflow-y-auto bg-white border rounded-xl border-gray-light-secondary">
        <History />
        <Loading />
      </div>
      <UserMessage />
    </div>
  );
};

const History = () => {
  const chatHistory = CalendarMachineContext.useSelector(
    (state) => state.context.chatHistory
  );

  const { send } = CalendarMachineContext.useActorRef();
  const calendarLoading = CalendarMachineContext.useSelector((state) =>
    state.matches("chatFlow.addingCalendarToUser")
  );

  const calendar = CalendarMachineContext.useSelector(
    (state) => state.context.calendar
  );

  return (
    <>
      {...chatHistory.map((message, index) => {
        if (message.role !== "system") {
          return (
            <Message.Wrapper
              className="overflow-visible"
              key={index}
              message={
                typeof message.content === "string" ? (
                  message.content
                ) : (
                  <Message.Calendar
                    days={message.content.days}
                    onSchedule={() => {
                      calendar && downloadICS(calendar);
                    }}
                    loading={calendarLoading}
                  />
                )
              }
              id={`chat-${message.content}`}
              type={message.role}
            />
          );
        }
      })}
    </>
  );
};

const UserMessage = () => {
  const [message, setMessage] = useState("");
  const { send } = CalendarMachineContext.useActorRef();
  const done = CalendarMachineContext.useSelector((state) => state.done);
  if (!done) {
    return (
      <TextAreaField
        label="Chat"
        placeholder="Chat here with AI..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="!bg-white/40 rounded-2xl w-full "
        endIcon={
          <button
            type="button"
            onClick={() => {
              send({ type: "REFACTOR_CALENDAR", suggestion: message });
              setMessage("");
            }}
            className="flex items-center justify-center h-8 p-3 font-medium text-white bg-black rounded-lg"
          >
            Send
          </button>
        }
      />
    );
  }
};

const Loading = () => {
  const loading = CalendarMachineContext.useSelector((state) =>
    state.matches("serviceStatus.loading")
  );

  if (loading) {
    return (
      <Message.Wrapper
        key="ai"
        message={"Ai bot is typing ..."}
        type="assistant"
        id="ai"
      />
    );
  }
};
