/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import router from "../app/Router"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import NewBillUI from "../views/NewBillUI"
import store from '../app/store'


describe("Given I am connected as an employee", () => {

  function onNavigate(pathname) {
    document.body.innerHTML = ROUTES({ pathname })
  }

  describe("When I am on NewBill Page", () => {
    test("then the mail icon in vertical layout should be highlighted", () => {

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon).toHaveClass('active-icon')
    })

    
  })
})
