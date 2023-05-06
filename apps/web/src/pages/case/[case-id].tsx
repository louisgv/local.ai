import { clsx } from "clsx"
import { AddCircle, TriangleFlag } from "iconoir-react"
import type { NextPage } from "next"
import { useState } from "react"

import { AppLayout } from "~features/layouts/app"

function Nav() {
  const [activeCase, setActiveCase] = useState(0)
  const [cases, setCases] = useState([])

  return (
    <nav className="flex flex-1 flex-col gap-4">
      <button
        className="bg-mauve-2 hover:bg-mauve-3 border border-mauve-11 hover:border-mauve-12 text-mauve-11 hover:text-mauve-12 transition-all p-2 rounded-lg flex gap-3"
        onClick={() => {
          const caseId = (cases[0]?.id || 0) + 1
          setActiveCase(caseId)
          setCases((cc) => [
            {
              id: caseId,
              name: `Case ${caseId}`,
              href: `/case/${caseId}`,
              icon: TriangleFlag,
              count: 12
            },
            ...cc
          ])
        }}>
        <AddCircle /> New Case
      </button>
      <ul
        role="list"
        className="flex flex-1 flex-col gap-y-4 overflow-auto max-h-96 border-b border-mauve-3 py-4 pr-2">
        {cases.map((item) => (
          <li key={item.name}>
            <a
              // href={item.href}
              onClick={() => {
                setActiveCase(item.id)
              }}
              className={clsx(
                item.id === activeCase
                  ? "bg-mauve-3 text-mauve-12"
                  : "text-mauve-11 hover:text-mauve-12 hover:bg-mauve-3",
                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
              )}>
              <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
              {item.name}
              {item.count ? (
                <span
                  className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full py-0.5 px-2.5 text-center text-xs font-medium leading-5 ring-1 ring-inset ring-gray-700"
                  aria-hidden="true">
                  {item.count}
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

const DemoPage: NextPage = () => {
  return (
    <AppLayout nav={<Nav />}>
      <div className="flex flex-col gap-y-4">
        <h1 className="text-2xl font-semibold">Demo Page</h1>
        <p className="text-mauve-11">This is a demo page.</p>
      </div>
    </AppLayout>
  )
}

export default DemoPage
