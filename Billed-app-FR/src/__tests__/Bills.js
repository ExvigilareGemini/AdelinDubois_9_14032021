import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import '@testing-library/jest-dom/extend-expect'
import { fireEvent, screen } from "@testing-library/dom"
import firebase from "../__mocks__/firebase"
import Router from "../app/Router.js"
import firestore from "../app/Firestore.js"






describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      jest.mock('../app/Firestore');
      firestore.bills = () => ({bills, get: jest.fn().mockResolvedValue()})

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      Object.defineProperty(window, 'location', { value: {hash: ROUTES_PATH['Bills']} })
      document.body.innerHTML = '<div id="root"></div>'
      Router();
      
      const billIcon = screen.getByTestId('icon-window');
      expect(billIcon.classList.contains('active-icon')).toBe(true);
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test('Then LoadingPage should be displayed if the page is loading', () => {
      const html = BillsUI({data : bills, loading : true})
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
    test('Then ErrorPage should be displayed if there is an error with its error message', () => {
      const html = BillsUI({data : bills, loading : false, error : 'Erreur de connexion internet'})
      const error = 'Erreur de connexion internet'
      document.body.innerHTML = html
      expect(screen.getAllByText(error)).toBeTruthy()
    })
    
    describe('When I click on new bill button', () => {
      test('Then, I should be sent to NewBill page', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = BillsUI({data : bills, loading : false, error : false})
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const testBills = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const newBillBtn = screen.getByTestId("btn-new-bill")
        const handleClickNewBill = jest.fn((e) => testBills.handleClickNewBill(e))
        newBillBtn.addEventListener("click", handleClickNewBill)
        fireEvent.click(newBillBtn)
        expect(handleClickNewBill).toHaveBeenCalled()
        const formNewBill = screen.queryByTestId("form-new-bill")
        expect(formNewBill).toBeTruthy()

      });
    });

    describe('When I click on the icon eye', () => {
      test('Then a modal should be open', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = BillsUI({data : bills, loading : false, error : false})
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const testBills = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const iconEye = screen.getAllByTestId("icon-eye")
        const handleClickIconEye = jest.fn(testBills.handleClickIconEye(iconEye[0]))
        iconEye[0].addEventListener("click", handleClickIconEye)
        fireEvent.click(iconEye[0])
        expect(handleClickIconEye).toHaveBeenCalled()
        const modale = screen.getByTestId('modaleFile')
        expect(modale).toBeTruthy()
      });
    });
  })
})

// test d'intégration GET
describe("Given I am a user connected as employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})