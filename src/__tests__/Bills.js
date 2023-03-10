/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";
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
    //   const root = document.createElement("div")
    //   root.setAttribute("id", "root")
    //   document.body.append(root)
    //   router()
    //   window.onNavigate(ROUTES_PATH.Bills)
     
    //   // const dates = screen.getAllByText("/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML")
    //   // const antiChrono = (a, b) => ((a < b) ? 1 : -1)
    //   // const datesSorted = [...dates].sort(antiChrono)
    //   const dates = screen.getAllByTestId("date")
    //   expect(dates).toEqual(["4 Avr. 04", "3 Mar. 03", "2 Fév. 02", "1 Jan. 01"])
    // });


    test("Eye icons should be visible", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const icons = screen.getAllByTestId("icon-eye");
      expect(icons.length).toBeGreaterThan(0);
    });

    test("When I have no store, then I get no bills", () => {
      const bills = new Bills({ store: null, document });
      expect(bills.getBills()).toBe(undefined);
    });

    // On vérifie que les bills dans store.js sont bien 4
    test("When I have store, then I get bills and list of bills", async () => {
      const bills = new Bills({ store: mockStore, document });
      const billsRetrieved = await bills.getBills();
      expect(billsRetrieved.length).toBe(4);
      const getBillsMock = jest.fn((e) => bills.getBills());
      expect(getBillsMock).not.toHaveBeenCalled();
    });

    test("It should return an array of bills", async () => {
      const bills = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })
      const spy = jest.spyOn(bills, "getBills");
      await bills.getBills();
      expect(spy).toHaveReturned();
    });

    test("Then bills should be fetched from mock API GET", async () => {      
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
  
        await waitFor(() => screen.getByText("Transports"))
        expect(screen.getByText("Transports")).toBeTruthy()
    }) 

    // On vérifie qu'on est bien sur la page des bills qui affiche le titre "Mes notes de frais"
    test("Then the title and the new bill button should be displayed", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@b" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      const contentHeader = await waitFor(() =>
        screen.getByText("Mes notes de frais")
      );
      expect(contentHeader).toBeTruthy();
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    });


    describe('When I click on the icon eye', () => {
      test('Then a modal should open', async () => {

        // first test
        // $.fn.modal = jest.fn()

        // document.body.innerHTML = BillsUI({ data: bills })
        // new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })

        // const eyeIcon = screen.getAllByTestId('icon-eye')
        // eyeIcon.forEach((eye) => {
        //   userEvent.click(eye)
        //   expect($.fn.modal).toHaveBeenCalledWith('show')
        // }) 
        
        // second test
        $.fn.modal = jest.fn()

        document.body.innerHTML = BillsUI({ data: bills })
        const newBills = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })

        newBills.handleClickIconEye = jest.fn();
        const eyeIcons = screen.getAllByTestId("icon-eye");
        eyeIcons.forEach((eye) => {
          eye.click()
          expect(newBills.handleClickIconEye).toBeCalled();
          expect(document.querySelector(".modal")).toBeTruthy();        
        })
      });
    })


    describe('When I click on New Bill button', () => {
      test('Then New Bill page should open', async () => {
        document.body.innerHTML = BillsUI({ data: bills })
        new Bills({ document, onNavigate, store: null, localStorage: null })

        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)

        const newBillBtn = screen.getByTestId("btn-new-bill")
        userEvent.click(newBillBtn)
        await waitFor(() => screen.getByText("Envoyer une note de frais"))
        expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
        expect(screen.queryByTestId('form-new-bill')).toBeTruthy()       
      })
    })

    
  }) 
})






