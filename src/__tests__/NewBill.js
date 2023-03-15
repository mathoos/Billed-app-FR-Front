/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import router from "../app/Router"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import NewBill from "../containers/NewBill.js"
import NewBillUI from "../views/NewBillUI"
import store from '../app/store'


describe("Given I am connected as an employee", () => {

  function onNavigate(pathname) {
    document.body.innerHTML = ROUTES({ pathname })
  }

  Object.defineProperty(window, 'localStorage', { 
    value: localStorageMock 
  })

  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))

  describe("When I am on NewBill Page", () => {
    test("then the mail icon in vertical layout should be highlighted", () => {

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon).toHaveClass('active-icon')
    })
    
    describe('When I click on "send" button but required inputs are not filled', () => {
      test('Then an alert should appear', async () => {

       
      });
    })

    describe('When I click on "choose a file" button and I select a file with an extension that is .jpg, .jpeg or .png', () => {
      test('Then the file uploads"', async () => {
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage }) // 
        const handleChangeFile = jest.fn(()=> newBill.handleChangeFile)
        const inputFile = screen.getByTestId('file') 
        inputFile.addEventListener('change', handleChangeFile) 
        fireEvent.change(inputFile,{ target: { files: [new File(['myTest.png'], 'myTest.png', {type: 'image/png'})] } }) 
        expect(handleChangeFile).toHaveBeenCalled() 
        expect(inputFile.files[0].name).toBe('myTest.png')     
      });
    })

    describe('When I click on "choose a file" button and I select a file with an extension that is not .jpg, .jpeg or .png', () => {
      test('Then an alert should appear sayin "wrong extension"', async () => {

       
      });
    })

    describe('When I click on an input', () => {
      test('Then the input should be focused', async () => {

       
      });
    })

    describe('When I click on "type" input"', () => {
      test('Then a list should appear', async () => {

       
      });
    })

    describe('When I click on "send" button and required inputs are well filled', () => {
      test('Then the form is sent', async () => {
        document.body.innerHTML = NewBillUI()

        const newNewBill = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })
        const handleSubmit = jest.fn((e) => newNewBill.handleSubmit(e))
        let fileFixture = new File(["img"], "image.png", {
          type: "image/png",
        });
        let fileInput = screen.getByTestId("file");
        let fileInputFilesGet = jest.fn().mockReturnValue([fileFixture]);
        let fileInputValueGet = jest.fn().mockReturnValue(fileFixture);
        

          Object.defineProperty(fileInput, 'value', {
            get: fileInputValueGet,
          });
        Object.defineProperty(fileInput, 'files', {
          get: fileInputFilesGet
        });
        screen.getByTestId("expense-name").value = "name-test";
        screen.getByTestId("datepicker").value = "2022-09-28";
        screen.getByTestId("amount").value = "128";
        screen.getByTestId("vat").value = "20";
        screen.getByTestId("pct").value = "70";
        let form = screen.getByTestId('form-new-bill')
        form.addEventListener("submit" , handleSubmit)
        let submit = screen.getByTestId('btn-send-bill')
        userEvent.click(submit)
        expect(handleSubmit).toHaveBeenCalled()
      })


      test('Then I am sent back on NewBill Page', async () => {

       
      });

      test('Then the new bill shows up on the list', async () => {

       
      });

      test('Then the new bill contains "pending" status', async () => {

       
      });

      test('Then the new bill contains the data sent', async () => {

       
      });
    })
  })
})
