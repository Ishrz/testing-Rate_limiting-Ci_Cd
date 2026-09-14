import { sum } from "../utils.js"


describe("sum function test", () => {

    test("should return the sum of two numbers", () => {
        expect(sum(2,3)).toBe(5)
    })

    test("should return the sum of two negative numbers", () => {
        expect(sum(-2,-3)).toBe(-5)
    })



})
