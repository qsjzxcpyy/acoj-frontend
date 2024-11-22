import type { BaseResponse_long_ } from "../models/BaseResponse_long_";
import type { BaseResponse_Page_AdminApplicationVO_ } from "../models/BaseResponse_Page_AdminApplicationVO_";
import type { HandleApplicationRequest } from "../models/HandleApplicationRequest";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import { BaseResponse_boolean_ } from "../models/BaseResponse_boolean_";
import { AdminApplicationQueryRequest } from "../models/AdminApplicationQueryRequest";
import { BaseResponse_List_AdminApplicationVO_ } from "../models/BaseResponse_List_AdminApplicationVO_";
import { AdminApplicationRequest } from "../models/AdminApplicationRequest";

export class AdminControllerService {
  /**
   * handleApplication
   * @param request request
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static handleApplicationUsingPost1(
    request: HandleApplicationRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/admin/application/handle",
      body: request,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * listApplications
   * @param request request
   * @returns BaseResponse_Page_AdminApplicationVO_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static listApplicationsUsingPost1(
    request: AdminApplicationQueryRequest
  ): CancelablePromise<BaseResponse_Page_AdminApplicationVO_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/admin/application/list/page",
      body: request,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * getMyApplications
   * @returns BaseResponse_List_AdminApplicationVO_ OK
   * @throws ApiError
   */
  public static getMyApplicationsUsingGet1(): CancelablePromise<BaseResponse_List_AdminApplicationVO_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/admin/application/my",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * applyForAdmin
   * @param request request
   * @returns BaseResponse_long_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static applyForAdminUsingPost1(
    request: AdminApplicationRequest
  ): CancelablePromise<BaseResponse_long_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/admin/apply",
      body: request,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
}
