/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom"
import '@testing-library/jest-dom/extend-expect'
import userEvent from "@testing-library/user-event"
import router from "../app/Router"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import NewBill from "../containers/NewBill.js"
import NewBillUI from "../views/NewBillUI"
import BillsUI from "../views/BillsUI.js";
import store from "../__mocks__/store";


describe("Given I am connected as an employee", () => {

  function onNavigate(pathname) {
    document.body.innerHTML = ROUTES({ pathname })
  }

  beforeEach(() => {
    // On simule la connection à la page Employée
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "employee@test.tld"
    }))
    
    // On simule la page NewBillUI dans le HTML
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    const html = NewBillUI()
    root.append(html)
    router()
    window.onNavigate(ROUTES_PATH.NewBill)     
  })
  

  describe("When I am on NewBill Page", () => {  

    test("then the mail icon in vertical layout should be highlighted", () => {
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon).toHaveClass('active-icon')
    }) 

    describe("When I select a file in correct format", () => {
      test("Then the file should be uploaded and no alert should be displayed", async () => {

        const mockStore = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
        };

        const newBill = new NewBill({document, store: mockStore, localStorage: window.localStorage});

        // Mocks : window.alert et console.error
        newBill.handleChangeFile = jest.fn(newBill.handleChangeFile);
        const mockAlert = jest.spyOn(window, "alert");
        window.alert = jest.fn();
        const mockError = jest.spyOn(console, "error")
        console.error = jest.fn()

        const inputJustificative = screen.getByTestId("file");

        // Simulate if the file is an jpg extension
        const fakeFile = new File(["test.jpg"], "test.jpg", {type: "image/jpg"})
        userEvent.upload(inputJustificative, fakeFile) 

        expect(inputJustificative.files[0].name).toBe("test.jpg");
        expect(mockAlert).not.toHaveBeenCalled();
        expect(mockError).not.toHaveBeenCalled();
        expect(inputJustificative.dataset.error).toBe("false")
      });
    });

    describe('When I select a file in incorrect format', () => {
      test('Then the file should not be uploaded and an alert should be displayed"', async () => {  
        const mockStore = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
        };

        const newBill = new NewBill({document, store: mockStore, localStorage: window.localStorage});

        // Mocks : window.alert et console.error     
        window.alert = jest.fn();

        const inputJustificative = screen.getByTestId("file");
        const incorrectFile = new File(["test.pdf"], "test.pdf", {type: "fichier/pdf"})
        userEvent.upload(inputJustificative, incorrectFile);  

        expect(window.alert).toHaveBeenCalled();
        expect(inputJustificative.files[0].name).toBe("test.pdf"); 
        expect(inputJustificative.dataset.error).toBe("true")       
        expect(inputJustificative).toBeTruthy();
      });
    })

    describe("Given when click on submit button of form new bill", () => {
      test("Then new bill should be submitted and create and redirect to bills page", () => {

        const newBill = new NewBill({document, onNavigate, store : null, localStorage: window.localStorage});

        // Mock data of new bill
        const dataNewBill = {
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl:
            "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          status: "pending",
          type: "Hôtel",
          commentary: "séminaire billed",
          name: "Hôtel à Paris",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2021-01-04",
          amount: 149,
          commentAdmin: "ok",
          email: "a@a",
          pct: 20,
        };

        screen.getByTestId("expense-type").value = dataNewBill.type;
        screen.getByTestId("expense-name").value = dataNewBill.name;
        screen.getByTestId("datepicker").value = dataNewBill.date;
        screen.getByTestId("amount").value = dataNewBill.amount;
        screen.getByTestId("vat").value = dataNewBill.vat;
        screen.getByTestId("pct").value = dataNewBill.pct;
        screen.getByTestId("commentary").value = dataNewBill.commentary;
        screen.getByTestId("expense-type").value = dataNewBill.type;
        newBill.fileUrl = dataNewBill.fileUrl;
        newBill.fileName = dataNewBill.fileName;

        const submitFormNewBill = screen.getByTestId("form-new-bill");
        expect(submitFormNewBill).toBeTruthy();

        // Mock function handleSubmit()
        const mockHandleSubmit = jest.fn(newBill.handleSubmit);
        submitFormNewBill.addEventListener("submit", mockHandleSubmit);
        fireEvent.submit(submitFormNewBill);

        expect(mockHandleSubmit).toHaveBeenCalled();

        // Mock function updateBill()
        const mockCreateBill = jest.fn(newBill.updateBill);
        submitFormNewBill.addEventListener("submit", mockCreateBill);
        fireEvent.submit(submitFormNewBill);

        expect(mockCreateBill).toHaveBeenCalled();
        // When form new bill is submited, return on bills page
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      });
    });
  })
})

describe("When I navigate to Dashboard employee", () => {
  test("Then it add bills from mock API POST", async () => {
    const getSpy = jest.spyOn(store, "post");
    const newBill = {
      id: "47qAXb6fIm2zOKkLzMro",
      vat: "80",
      fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      status: "pending",
      type: "Hôtel et logement",
      commentary: "séminaire billed",
      name: "encore",
      fileName: "preview-facture-free-201801-pdf-1.jpg",
      date: "2004-04-04",
      amount: 400,
      commentAdmin: "ok",
      email: "a@a",
      pct: 20,
    };
    const bills = await store.post(newBill);
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(bills.data.length).toBe(5);
  });

  test("Then it add bills from an API and fails with 404 message error", async () => {
    store.post.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 404"))
    );
    const html = BillsUI({ error: "Erreur 404" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("Then it add bill from an API and fails with 500 message error", async () => {
    store.post.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 500"))
    );
    const html = BillsUI({ error: "Erreur 500" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
