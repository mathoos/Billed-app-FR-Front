/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom/extend-expect'
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";
import store from "../__mocks__/store";
import router from "../app/Router.js";


jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }

  beforeEach(() => {
    // On simule la connection à la page Employée
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "employee@test.tld"
    }))    
  })

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy();
    })


    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const dates = screen.getAllByTestId("date").map(a => a.innerHTML)
      expect(dates).toEqual(["4 Avr. 04", "3 Mar. 03", "2 Fév. 02", "1 Jan. 01"])
    });

    test("Then the first bill contains the correct data", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const typeBill = screen.getAllByTestId("type");
      const nameBill = screen.getAllByTestId("name");
      const dateBill = screen.getAllByTestId("date");
      const amountBill = screen.getAllByTestId("amount");
      const statusBill = screen.getAllByTestId("status");

      expect(typeBill[0].innerHTML).toBe("Hôtel et logement");     
      expect(nameBill[0].innerHTML).toBe("encore");     
      expect(dateBill[0].innerHTML).toBe("4 Avr. 04");     
      expect(amountBill[0].innerHTML).toBe("400 €");     
      expect(statusBill[0].innerHTML).toBe("pending");
    });


    test("Eye icons should be visible", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const icons = screen.getAllByTestId("icon-eye");
      expect(icons.length).toBeGreaterThan(0);
    });


    it("should display all the bills fetched from the API", async () => {
      const numberOfBills = screen.getAllByTestId("row");
      expect(numberOfBills).toHaveLength(4);
    });


    describe('When I click on the icon eye', () => {
      test('Then handleClickIconEye function is called', async () => {

        $.fn.modal = jest.fn()

        document.body.innerHTML = BillsUI({ data: bills })
        const newBills = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })

        newBills.handleClickIconEye = jest.fn();
        const eyeIcons = screen.getAllByTestId("icon-eye");
        eyeIcons.forEach((eye) => {
          eye.click()
          expect(newBills.handleClickIconEye).toBeCalled();            
        })  
      });


      test('Then a modal should open', async () => {
        $.fn.modal = jest.fn()

        document.body.innerHTML = BillsUI({ data: bills })
        new Bills({ document, onNavigate: null, store: null, localStorage: null })

        const eyeIcon = screen.getAllByTestId('icon-eye')[0]
        userEvent.click(eyeIcon)

        expect($.fn.modal).toHaveBeenCalledWith('show')
      });


      test("then a modal should display the correct media", () => {

        document.body.innerHTML = BillsUI({ data: bills })
        const newBills = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })

        const icon = document.createElement("div");
        icon.setAttribute("data-bill-url", "img.png");
        newBills.handleClickIconEye(icon);
        const img = document.querySelector(".bill-proof-container img")
    
        expect(img.src).toBe("http://localhost/img.png")     
      });
    });


    describe('When I click on New Bill button', () => {
      test('Then New Bill page should open', async () => {

        document.body.innerHTML = BillsUI({ data: bills })
        new Bills({ document, onNavigate, store, localStorage: null })


        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)

        const newBillBtn = screen.getByTestId("btn-new-bill")
        userEvent.click(newBillBtn)
        await waitFor(() => screen.getByText("Envoyer une note de frais"))
        expect(screen.queryByTestId('form-new-bill')).toBeTruthy()
       
      })
    });

    
    describe("When it's loading", () => {
      test("Then it should have a loading page", () => {
        // Build DOM as if page is loading
        const html = BillsUI({
          data: [],
          loading: true,
        });
        document.body.innerHTML = html;
  
        expect(screen.getAllByText("Loading...")).toBeTruthy();
      });
    });


    describe("When there is an error", () => {
      test("then bills are fetched from the API and it fails with a 404 message error", async () => {

        jest.spyOn(mockStore, "bills")
  
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})

        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
  
        await new Promise(process.nextTick)
        const message = await screen.findByText(/Erreur 404/)
        expect(message).toBeTruthy()
      });
      
      test("then bills are fetched from the API and it fails with a 500 message error", async () => {

        jest.spyOn(mockStore, "bills")
  
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
  
        await new Promise(process.nextTick)
        const message = await screen.findByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    });
  });
})







