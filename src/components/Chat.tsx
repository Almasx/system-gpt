import { useState } from "react";
import { ChatMachineContext } from "../lib/machines/chatMachine";
import { Message } from "./ui/message";
import TextAreaField from "./ui/text-area";

const Chat = () => {
  return (
    <>
      <div className="flex flex-col w-full mt-5 border-b border-x border-gray-light-secondary rounded-xl overflow-clip ">
        <History />
        <Loading />
        <Complete />
      </div>

      <Error />
      <Suggestion />
    </>
  );
};

export const History = () => {
  const chatHistory = ChatMachineContext.useSelector(
    (state) => state.context.chatHistory
  );
  const calendarLoading = ChatMachineContext.useSelector((state) =>
    state.matches("chatFlow.addingCalendarToUser")
  );
  const { send } = ChatMachineContext.useActorRef();

  return (
    <>
      {...chatHistory.map((message, index) => {
        if (message.role !== "system" && !message.hiddenUI) {
          return (
            <Message.Wrapper
              key={index}
              message={
                typeof message.content === "string" ? (
                  message.content
                ) : (
                  <Message.Calendar
                    days={message.content.days}
                    onSchedule={() => {
                      send({
                        type: "ADD_CALENDAR",
                      });
                    }}
                    loading={calendarLoading}
                  />
                )
              }
              id={index.toString()}
              type={message.role}
            />
          );
        }
      })}
    </>
  );
};

const Error = () => {
  const error = ChatMachineContext.useSelector((state) =>
    state.matches("serviceStatus.error")
  );

  if (error) {
    return (
      <div className="p-2 text-sm duration-150 ease-in-out border border-red-500 rounded-lg outline-none bg-red-500/70 text-light backdrop-blur-sm">
        Internal Error with OpenAI
      </div>
    );
  }
};

export const Suggestion = () => {
  const [suggestion, setSuggestion] = useState("");
  const { send } = ChatMachineContext.useActorRef();
  const done = ChatMachineContext.useSelector((state) => state.done);
  if (!done) {
    return (
      <div className="p-4 pt-5 -ml-[6.5px]  bg-light-secondary/60 fixed bottom-0 w-[1024px] left-1/2 -translate-x-1/2 backdrop-blur border border-gray-light-secondary rounded-xl overflow-clip">
        <TextAreaField
          label="Suggestion"
          placeholder="I want to change it to ..."
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          className="!bg-white/40 rounded-2xl"
          endIcon={
            <button
              type="button"
              onClick={() => {
                send({ type: "REFACTOR_CALENDAR", suggestion });
                setSuggestion("");
              }}
              className="flex items-center justify-center h-8 p-3 font-medium text-white bg-black rounded-lg"
            >
              Suggest
            </button>
          }
        />
      </div>
    );
  }
};

const Loading = () => {
  const loading = ChatMachineContext.useSelector((state) =>
    state.matches("serviceStatus.loading")
  );

  if (loading) {
    return (
      <Message.Wrapper
        key="ai"
        message={"Ai bot is typing ..."}
        type="assistant"
        id="ai"
        // error={error?.message}
      />
    );
  }
};

const Complete = () => {
  const done = ChatMachineContext.useSelector((state) => state.done);

  if (done) {
    return (
      <p className="flex pt-1 text-base break-all">
        Your schedule is completed 🚀 Checkout: your{" "}
        <a
          href="https://calendar.google.com/calendar/"
          className="text-blue-500"
        >
          {" "}
          Calendar
        </a>
      </p>
    );
  }
};

export default Chat;
