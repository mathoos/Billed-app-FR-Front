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
import router from "../app/Router.js";
import store from "../__mocks__/store";




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

    test("Then the first bill contains correct data", () => {
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

    // On vérifie que les bills dans store.js sont bien 4
    it("should return 4 bills", async () => {
      const numberOfBills = screen.getAllByTestId("row");
      expect(numberOfBills).toHaveLength(4);
    });


    // On vérifie qu'on est bien sur la page des bills qui affiche le titre "Mes notes de frais"
    test("Then the title and the new bill button should be displayed", async () => { 
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
        expect(screen.queryByTestId('form-new-bill')).toBeTruthy()       
      })
    })

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
  }) 
})

describe("When I navigate to Dashboard employee", () => {
  test("fetches bills from mock API GET", async () => {
    const getSpy = jest.spyOn(store, "get");
    const bills = await store.get();
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(bills.data.length).toBe(4);
  });

  test("fetches bills from an API and fails with 404 message error", async () => {
    store.get.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 404"))
    );
    const html = BillsUI({ error: "Erreur 404" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("fetches messages from an API and fails with 500 message error", async () => {
    store.get.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 500"))
    );
    const html = BillsUI({ error: "Erreur 500" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});





