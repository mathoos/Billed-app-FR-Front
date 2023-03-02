/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import store from "../__mocks__/store.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";


describe("Given I am connected as an employee", () => {
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }

  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
  }))

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
  
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy();
    })

    // test("Then bills should be ordered from earliest to latest", () => {
    //   document.body.innerHTML = BillsUI({ data: bills })
    //   const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
    //   const antiChrono = (a, b) => ((a < b) ? 1 : -1)
    //   const datesSorted = [...dates].sort(antiChrono)
    //   expect(dates).toEqual(datesSorted)
    // });


    describe('When I click on the icon eye', () => {
      test('Then a modal should open', async () => {
  
        document.body.innerHTML = BillsUI({ data: bills })
        const billContainer = new Bills({ document, onNavigate, store: null, localStorage: localStorageMock })

        $.fn.modal = jest.fn()  
        const handleClickIcon = jest.fn(billContainer.handleClickIconEye)

        const eyeIcon = screen.getAllByTestId("icon-eye"); 
        eyeIcon.forEach(icon => {
          icon.addEventListener("click", handleClickIcon(icon))
        })
        
        const proof = await waitFor(() => screen.getByText("Justificatif"));
        expect(proof).toBeTruthy();
        expect(handleClickIcon).toHaveBeenCalled();
      });
    })


    describe('When I click on New Bill button', () => {
      test('Then New Bill page should open', async () => {
        document.body.innerHTML = BillsUI({data: bills});
        const billContainer = new Bills({document: document, onNavigate : onNavigate, store: store, localStorage: window.localStorage});
        
        $.fn.modal = jest.fn()
        const handleNewBill = jest.fn(billContainer.handleClickNewBill);

        const NewBillBtn = screen.getByTestId('btn-new-bill');
        NewBillBtn.addEventListener('click', handleNewBill);
        userEvent.click(NewBillBtn);
        
        const sendBill = await waitFor(() => screen.queryByText("Envoyer une note de frais"));
        expect(sendBill).toBeTruthy();
        expect(handleNewBill).toHaveBeenCalled();
      })
    })
  }) 
})



