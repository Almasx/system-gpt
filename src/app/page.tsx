"use client";

import Spline from "@splinetool/react-spline";
import Image from "next/image";
import Link from "next/link";
import { Calendar } from "~/components/calendar";
import DisplayChunk from "../../public/display-chunk.png";
import Gradient from "../../public/gradient.png";
import DisplayTree from "../../public/tree.png";

export default function App() {
  return (
    <main className="w-screen overflow-clip">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/wn2trgmOUTfi02Wd/scene.splinecode" />
      </div>
      <main className="max-w-6xl mx-auto text-white">
        <section className="flex flex-col items-center justify-center h-screen max-w-5xl gap-6 mx-auto">
          <h1 className="relative z-10 font-semibold text-center uppercase text-7xl mix-blend-difference">
            Your Personalized Roadmap to Success Starts Here
          </h1>
          <p className="relative z-10 max-w-sm mb-4 text-center mix-blend-difference">
            Introducing Sapar GPT: The intelligent system that maps your goals
            into achievable daily actions
          </p>
          <Link
            href="/journeys"
            className="relative z-10 px-4 py-2 text-lg font-semibold text-black duration-75 bg-white rounded-xl hover:bg-blue-700 hover:text-white"
          >
            Start your journey
          </Link>
        </section>

        <section className="flex flex-col items-center justify-center h-screen gap-5 text-black">
          <div className="flex h-56 gap-5">
            <div className="grid h-full text-4xl font-semibold text-center border aspect-square place-items-center font rounded-2xl bg-neutral-100">
              Divide & Conquer
            </div>
            <Image
              src={DisplayChunk}
              alt="display chunk"
              className="h-full border rounded-xl"
            />
            <div className="p-6 border bg-neutral-100 rounded-2xl grow overflow-clip">
              <header className="text-xl whitespace-nowrap mb-9">
                Set a{" "}
                <span className="italic font-semibold text-blue-500">
                  SMART
                </span>{" "}
                goal
              </header>

              <div className="flex flex-row items-start gap-3 px-3 py-5 bg-white border rounded-xl border-gray-light-secondary w-96">
                <div
                  className="flex w-8 h-8 mr-0 rounded-full shrink-0 grow-0"
                  style={{
                    background:
                      "radial-gradient(70.71% 70.71% at 50% 50%, #A3A9FE 0%, #757FF9 36.25%, #1E2BEC 73.23%, #0010FD 100%)",
                  }}
                />

                <div className="flex flex-col gap-3 grow">
                  <p className="flex pt-1 ">
                    Hello! I'm Dax, your startup AI genie. Get rolling by
                    generating a SMART goal.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid w-full grid-cols-3 gap-5">
            <div className="h-56 p-6 border bg-neutral-100 rounded-2xl grow overflow-clip">
              <header className="mb-3 text-xl">Break down your goals</header>

              <div className="relative flex flex-col scale-75 bg-white border rounded-xl w-96">
                <div className="absolute p-1 text-xs uppercase bg-yellow-200 border border-yellow-500 rounded-lg right-1 rotate-12 text-yellow-950 -top-2">
                  High
                </div>
                <header className="grid px-3 py-2 font-mono uppercase border-b place-items-center font-meduim border-gray-light-secondary">
                  Learn digital marketing
                </header>
                <div className="px-3 py-2 border-b bg-light-secondary border-gray-light-secondary">
                  Understand the various digital marketing channels and how to
                  implement effective strategies. Learn how to measure the
                  success of digital marketing campaigns.
                </div>
                <div className="flex gap-3 px-3 py-2 pb-2.5 overflow-x-auto hide-scrollbar nodrag">
                  {["Digital marketing", "SEO"].map((keyword) => (
                    <div
                      className="p-1 text-xs uppercase border rounded-lg bg-light-secondary border-gray-light-secondary whitespace-nowrap"
                      key={`${keyword}`}
                    >
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/journeys"
              className="relative grid h-56 p-6 border rounded-2xl grow overflow-clip place-items-center group"
            >
              <p className="relative z-10 text-4xl font-bold text-center text-white duration-200 bg-clip-text group-hover:text-black">
                Create <span className="italic ">your</span> journey
              </p>
              <Image
                src={Gradient}
                alt="gradient"
                className="absolute inset-0 duration-200 group-hover:opacity-0 "
              />
            </Link>
            <div className="h-56 p-6 border bg-neutral-100 rounded-2xl grow overflow-clip">
              <header className="mb-3 text-xl">Create a calendar</header>
              <div className="flex bg-white border rounded-xl ">
                <Calendar.Wrapper>
                  {[
                    {
                      date: new Date(),
                      events: [
                        {
                          end: new Date(),
                          start: new Date(),
                          summary:
                            "Daily Reminder to Practice Shooting on Goal",
                          description:
                            "Set a daily reminder on user's phone to practice shooting on goal for a pre-defined amount of time",
                        },
                      ],
                    },
                    {
                      date: new Date(),
                      events: [
                        {
                          end: new Date(),
                          start: new Date(),
                          summary:
                            "Daily Reminder to Practice Shooting on Goal",
                          description:
                            "Set a daily reminder on user's phone to practice shooting on goal for a pre-defined amount of time",
                        },
                      ],
                    },
                  ].map((day) => (
                    <Calendar.Day {...day} key={day.date.toISOString()} />
                  ))}
                </Calendar.Wrapper>
              </div>
            </div>
          </div>

          <Image
            src={DisplayTree}
            className="w-full h-56 rounded-xl"
            alt="display-tree"
          />
        </section>
      </main>
    </main>
  );
}
