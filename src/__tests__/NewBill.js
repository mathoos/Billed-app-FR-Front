/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import "@testing-library/jest-dom"
import '@testing-library/jest-dom/extend-expect'
import userEvent from "@testing-library/user-event"
import router from "../app/Router"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import NewBill from "../containers/NewBill.js"
import NewBillUI from "../views/NewBillUI"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import store from '../app/store'


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

    test('Then required inputs should have required attribute', () => {
      let expenseType = screen.getAllByTestId('expense-type')
      expect(expenseType[0]).toHaveAttribute(`required`)
      let datePicker = screen.getAllByTestId('datepicker')
      expect(datePicker[0]).toHaveAttribute(`required`)
      let amount = screen.getAllByTestId('amount')
      expect(amount[0]).toHaveAttribute(`required`)
      let pct = screen.getAllByTestId('pct')
      expect(pct[0]).toHaveAttribute(`required`)
      let file = screen.getAllByTestId('file')
      expect(file[0]).toHaveAttribute(`required`)
    })  

    describe('When I select a file with a correct extension', () => {
      test('Then the file should be uploaded"', async () => {
        window.alert = jest.fn()
        //window.fetch = jest.fn().mockResolvedValue({})
        const file = screen.getByTestId("file");
        // const fakeFile = new File(["test.jpg"], "test.jpg", {type: "image/jpg"})
        // userEvent.upload(file, fakeFile)  
        console.log(file.dataset)
      
        // Simulate if the file is an jpg extension
        fireEvent.change(file, {
          target: {
            files: [new File(["file.jpg"], "file.jpg", { type: "file/jpg" })],
          },       
        });
        expect(file.dataset.error).toBeFalsy()     
        expect(window.alert).not.toHaveBeenCalled()
      });
    })

    describe('When I select a file with a wrong extension', () => {
      test('Then the file should not be uploaded"', async () => {    
        const file = screen.getByTestId("file")
        const wrongFile = new File(["pdf"], "test.pdf", {type: "fichier/pdf"})
        userEvent.upload(file, wrongFile);   
        expect(file.dataset.error).toBeTruthy()      
      });
    })


    describe('When I click on "send" button and required inputs are well filled', () => {
      test('Then the form is sent', async () => {

        const newBill = new NewBill({document, onNavigate, store: null, bills:bills, localStorage: window.localStorage})

        // On créé les données de la nouvelle note de frais
        const inputsValue = {
          type: "Hôtel et logement",
          date: "28 Avr. 22",
          amount: "200",
          name: "Test",
          pct: 50,
          commentary: "",
          fileName: "image.jpg",
        }
        
        inputsValue.type = screen.getAllByTestId('expense-type').value
        inputsValue.name = screen.getAllByTestId('expense-name').value 
        inputsValue.date = screen.getAllByTestId('datepicker').value 
        inputsValue.amount = screen.getAllByTestId('amount').value 
        inputsValue.pct = screen.getAllByTestId('pct').value     
        inputsValue.commentary = screen.getAllByTestId('commentary').value 
        
        newBill.fileName = inputsValue.fileName

        // On simule les fonctions updateBill et handleSubmit
        newBill.updateBill = jest.fn();
        const handleSubmit=jest.fn((e) => newBill.handleSubmit(e))
        
        const form = screen.getByTestId("form-new-bill");
        form.addEventListener("click", handleSubmit);
        userEvent.click(form)

        expect(handleSubmit).toHaveBeenCalled()
        expect(newBill.updateBill).toHaveBeenCalled()
      })
    })
  })
})
