import type { BaseResponse_Page_User_ } from "../models/BaseResponse_Page_User_";
import type { BaseResponse_Page_UserVO_ } from "../models/BaseResponse_Page_UserVO_";
import type { BaseResponse_User_ } from "../models/BaseResponse_User_";
import type { BaseResponse_UserLoginRespVO_ } from "../models/BaseResponse_UserLoginRespVO_";
import type { BaseResponse_UserVO_ } from "../models/BaseResponse_UserVO_";
import type { DeleteRequest } from "../models/DeleteRequest";
import type { UserAddRequest } from "../models/UserAddRequest";
import type { UserLoginRequest } from "../models/UserLoginRequest";
import type { UserQueryRequest } from "../models/UserQueryRequest";
import type { UserRegisterRequest } from "../models/UserRegisterRequest";
import type { UserUpdateMyRequest } from "../models/UserUpdateMyRequest";
import type { UserUpdateRequest } from "../models/UserUpdateRequest";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import { BaseResponse_long_ } from "../models/BaseResponse_long_";
import { BaseResponse_boolean_ } from "../models/BaseResponse_boolean_";
import { BaseResponse_LoginUserVO_ } from "../models/BaseResponse_LoginUserVO_";

export class UserControllerService {
  /**
   * addUser
   * @param userAddRequest userAddRequest
   * @returns BaseResponse_long_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static addUserUsingPost1(
    userAddRequest: UserAddRequest
  ): CancelablePromise<BaseResponse_long_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/add",
      body: userAddRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * deleteUser
   * @param deleteRequest deleteRequest
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static deleteUserUsingPost1(
    deleteRequest: DeleteRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/delete",
      body: deleteRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * getUserById
   * @param id id
   * @returns BaseResponse_User_ OK
   * @throws ApiError
   */
  public static getUserByIdUsingGet1(
    id?: number
  ): CancelablePromise<BaseResponse_User_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/user/get",
      query: {
        id: id,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * getLoginUser
   * @returns BaseResponse_LoginUserVO_ OK
   * @throws ApiError
   */
  public static getLoginUserUsingGet1(): CancelablePromise<BaseResponse_LoginUserVO_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/user/get/login",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * getUserVOById
   * @param id id
   * @returns BaseResponse_UserVO_ OK
   * @throws ApiError
   */
  public static getUserVoByIdUsingGet1(
    id?: number
  ): CancelablePromise<BaseResponse_UserVO_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/user/get/vo",
      query: {
        id: id,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * listUserByPage
   * @param userQueryRequest userQueryRequest
   * @returns BaseResponse_Page_User_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static listUserByPageUsingPost1(
    userQueryRequest: UserQueryRequest
  ): CancelablePromise<BaseResponse_Page_User_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/list/page",
      body: userQueryRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * listUserVOByPage
   * @param userQueryRequest userQueryRequest
   * @returns BaseResponse_Page_UserVO_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static listUserVoByPageUsingPost1(
    userQueryRequest: UserQueryRequest
  ): CancelablePromise<BaseResponse_Page_UserVO_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/list/page/vo",
      body: userQueryRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userLogin
   * @param userLoginRequest userLoginRequest
   * @returns BaseResponse_UserLoginRespVO_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userLoginUsingPost1(
    userLoginRequest: UserLoginRequest
  ): CancelablePromise<BaseResponse_UserLoginRespVO_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/login",
      body: userLoginRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userLogout
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userLogoutUsingPost1(): CancelablePromise<
    BaseResponse_boolean_ | any
  > {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/logout",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * RefreshToken
   * @param refreshToken refreshToken
   * @returns BaseResponse_UserLoginRespVO_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static refreshTokenUsingPost1(
    refreshToken?: string
  ): CancelablePromise<BaseResponse_UserLoginRespVO_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/refreshToken",
      query: {
        refreshToken: refreshToken,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userRegister
   * @param userRegisterRequest userRegisterRequest
   * @returns BaseResponse_long_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userRegisterUsingPost1(
    userRegisterRequest: UserRegisterRequest
  ): CancelablePromise<BaseResponse_long_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/register",
      body: userRegisterRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * updateUser
   * @param userUpdateRequest userUpdateRequest
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static updateUserUsingPost1(
    userUpdateRequest: UserUpdateRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/update",
      body: userUpdateRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * updateMyUser
   * @param userUpdateMyRequest userUpdateMyRequest
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static updateMyUserUsingPost1(
    userUpdateMyRequest: UserUpdateMyRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/update/my",
      body: userUpdateMyRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
}
