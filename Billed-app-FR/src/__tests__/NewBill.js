import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { fireEvent, getByTestId, screen } from "@testing-library/dom"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import firebase from "../__mocks__/firebase"







describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe('When I insert a file inside file input', () => {
      test("Then I should call handleChangeFile", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))      
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const newBillTest = new NewBill({document, onNavigate, firestore, localStorage: window.localStorage})
        const fileTest = screen.getByTestId('file')
        const handleChangeFile = jest.fn((e) => newBillTest.handleChangeFile(e))

        fileTest.addEventListener("change", handleChangeFile)
        fireEvent.change(fileTest)
        expect(handleChangeFile).toHaveBeenCalled()
      })
    });

    describe('When I submit the form', () => {
      test('Then I should be sent to Bill Page', () => {
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))      
          const html = NewBillUI()
          document.body.innerHTML = html
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          const firestore = null
          const newBillTest = new NewBill({document, onNavigate, firestore, localStorage: window.localStorage})
          const form = screen.getByTestId('form-new-bill');
          const handleSubmit = jest.fn((e) => newBillTest.handleSubmit(e))

          form.addEventListener("submit", handleSubmit)
          fireEvent.submit(form)
          expect(handleSubmit).toHaveBeenCalled()
          expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()

      });
    });

  })
})

// test d'intégration POST
describe("Given I am a user connected as employee", () => {
  describe("When I navigate to NewBill", () => {
    test("fetches bills from mock API POST", async () => {
      const getSpy = jest.spyOn(firebase, "post")
      const bills = await firebase.post()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
  })
})