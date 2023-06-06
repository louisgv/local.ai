import clsx from "clsx"
import type { ReactNode } from "react"

import { QuickLink } from "../link"

const defaultNavItems = [
  {
    link: "#features",
    name: "Features"
  }
]

export type NavItems = (typeof defaultNavItems)[number]

/**
 * - Header
 * - {children}
 * - Footer
 */
export const BasicLayout = ({
  nav = defaultNavItems as NavItems[],
  children = null as ReactNode,
  logo = null as ReactNode,
  rightNav = null as ReactNode
}) => {
  return (
    <div className="flex flex-col bg-mauve-1 text-mauve-11 h-screen overflow-y-auto overflow-x-hidden">
      {/* <!-- Header --> */}
      <header className="sticky top-0 p-4 backdrop-blur-md backdrop-saturate-100 bg-transparent text-mauve-11 before:bg-mauve-3 z-50">
        <div className="container mx-auto flex justify-between items-center gap-12">
          {logo}
          <nav className="hidden md:flex flex-1">
            <ul className="flex space-x-8">
              {nav.map((navi) => (
                <li
                  key={navi.link}
                  className="text-mauve-11 hover:text-mauve-12">
                  <a href={navi.link}>{navi.name}</a>
                </li>
              ))}

              {/* <li className="text-mauve-11 hover:text-mauve-12">
              <a href="#contact-us">Contact Us</a>
            </li> */}
            </ul>
          </nav>
          {rightNav}
        </div>
      </header>
      <main className="max-w-screen-2xl self-center">{children}</main>

      <footer className={clsx("bg-mauve-2 text-mauve-11", "px-8 py-12")}>
        <div
          className={clsx(
            "flex flex-col md:flex-row gap-12 items-center justify-center"
          )}>
          {/* <!-- Company Information --> */}
          <div className="text-mauve-10 hover:text-mauve-11 hover:underline hover:underline-offset-2 transition-all">
            All Right Reserved, © 2023{" "}
            <QuickLink href="https://github.com/louisgv/">
              <code>L ❤️ ☮ ✋</code>
            </QuickLink>
          </div>

          {/* <!-- Contact Details --> */}
          {/* <div>
          <h3 className="font-bold text-xl mb-2" id="contact-us">
            Contact Us
          </h3>
          <code>support (at) jalias (dot) com</code>
        </div> */}
          {/* <p>Phone: +1 (123) 456-7890</p> */}
          {/* <!-- Social Media Icons --> */}
          {/* <div className="flex justify-center items-center mt-8 space-x-4">
    <a href="#">
      <img src="https://yourwebsite.com/images/twitter_icon.png" alt="Twitter" width="32" height="32"></a>
    <a href="#"><img src="https://yourwebsite.com/images/linkedin_icon.png" alt="LinkedIn" width="32" height="32"></a>
  </div> */}
          {/* <!-- Legal Links --> */}
          {/* <div className="text-center mt-8">
    <a href="#" className="text-white hover:text-green-500">Terms of Service</a> |
    <a href="#" className="text-white hover:text-green-500">Privacy Policy</a>
  </div> */}
        </div>
      </footer>
    </div>
  )
}
