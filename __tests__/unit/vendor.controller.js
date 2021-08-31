const vendorController = require('../../controllers/vendorController');

const Van = require('../../models/van');
const Snack = require('../../models/snack')

describe('vendorController', function () {
    const mockResponse = {
            render: jest.fn(),
            redirect: jest.fn()
        }

    const mockRequest = {
        session: {
            name: "Test Van 0"
        },
        params: {
            lat: -47.820799124289685,
            long: 143.02401435985533
        }
    }
    // the setup function does a few things before
    // any test is run
    beforeAll(() => {
        
        // clear the render method (also read about mockReset)
        mockResponse.render.mockClear();
      
        // mock the Mongoose findOne() method return a
        // dummy list of authors
        Van.findOne = jest.fn().mockResolvedValue({
            _id:{"$oid":"60b32b1e69ec705414036db6"},
            readyForOrder:true,
            availability:["10001","10002","10003","10004","10006","10005","10007"],
            sumScore:5,
            sumRatings:1,
            name:"Test Van 0",
            password:"$2a$10$rq6UlbA/GRmsnIZ4lFCwDuAkmiW.M7bExMoIq7luPXDEtfQKv4n9C",
            __v:29,
            lat:"-37.820799124289685",
            long:"145.02401435985533"
        });

        Van.findOne.mockImplementationOnce(() => ({
            save: jest.fn()
        }));
      vendorController.setVanLocation(mockRequest, mockResponse);

    });

    describe('setVanLocation', function() {
        test("should try find van from database", function(){
            expect(Van.findOne).toHaveBeenCalledTimes(1);
            expect(Van.findOne).toHaveBeenCalledWith({name: mockRequest.session.name});
        })

        test("should redirect back to vendor's page", function(){
            expect(mockResponse.redirect).toHaveBeenCalledTimes(1);
            expect(mockResponse.redirect).toHaveBeenCalledWith("/vendor");
        })
    });
});
