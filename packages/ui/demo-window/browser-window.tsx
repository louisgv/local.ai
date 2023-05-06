import { Lock, Refresh, SendMail } from "iconoir-react"
import { type ReactNode } from "react"

import { GenericDemoWindow } from "./generic-window"

export const GenericBrowserDemoWindow = ({
  url = "localai.com" as ReactNode,
  className = "",
  menu = null as ReactNode,
  children = null as ReactNode,
  secured = false
}) => (
  <GenericDemoWindow
    className={className}
    topBar={
      <div className="flex w-full border-b-2 border-mauve-2 py-0.5 gap-2 px-2 items-center">
        <div className="flex relative w-full rounded-md items-center justify-center px-4 text-xs font-medium text-mauve-12 bg-mauve-4 h-full">
          {secured && (
            <Lock className="absolute left-1 text-green-10" height={16} />
          )}
          <span className="w-40 text-center truncate">{url}</span>
          <Refresh className="absolute right-1" height={10} />
        </div>
        {menu}
      </div>
    }>
    {children}
  </GenericDemoWindow>
)

export const MailBrowserDemoWindow = ({ className = "" }) => {
  return (
    <GenericBrowserDemoWindow
      secured
      className={className}
      menu={
        <button
          style={{
            width: 18,
            height: 18
          }}
          className="bg-purple-9 rounded-md flex-shrink-0 p-1"
        />
      }>
      <div className="flex flex-row truncate h-full relative">
        <div className="flex flex-col w-full h-full p-2 gap-2">
          <div className="flex flex-row gap-3 w-full">
            <div className="rounded-md w-12 h-6 bg-mauve-8 flex justify-center">
              <SendMail className="text-mauve-2" />
            </div>
            <div className="w-1/2 flex flex-col gap-1 py-1">
              <div className="w-1/2 h-1/2 bg-mauve-8 rounded-md" />
              <div className="w-full h-1/2 bg-mauve-3 rounded-md" />
            </div>
          </div>
          <div className="flex flex-row gap-3 w-full">
            <div className="rounded-md w-6 bg-mauve-3" />
            <div className="flex flex-col gap-1 w-full">
              <div className="flex flex-row gap-2 h-3 w-full">
                <div className="w-full bg-mauve-3 rounded-md" />
                <div className="w-full bg-mauve-3 rounded-md" />
                <div className="w-full bg-mauve-3 rounded-md" />
                <div className="w-full bg-mauve-3 rounded-md" />
              </div>
              <div className="h-6 bg-mauve-3 rounded-md" />
              <div className="h-6 bg-mauve-3 rounded-md" />
              <div className="h-6 bg-mauve-3 rounded-md" />
              <div className="h-6 bg-mauve-3 rounded-md" />
              <div className="h-6 bg-mauve-3 rounded-md" />
              <div className="h-6 bg-mauve-3 rounded-md" />
              <div className="h-6 bg-mauve-3 rounded-md" />
              <div className="h-6 bg-mauve-3 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </GenericBrowserDemoWindow>
  )
}
