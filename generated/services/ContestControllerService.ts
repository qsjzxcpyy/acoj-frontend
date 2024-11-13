/* eslint-disable */
import type { BaseResponse_boolean_ } from "../models/BaseResponse_boolean_";
import type { BaseResponse_ContestVO_ } from "../models/BaseResponse_ContestVO_";
import type { BaseResponse_long_ } from "../models/BaseResponse_long_";
import type { BaseResponse_Page_ContestVO_ } from "../models/BaseResponse_Page_ContestVO_";
import type { ContestAddRequest } from "../models/ContestAddRequest";
import type { ContestQueryRequest } from "../models/ContestQueryRequest";
import type { ContestUpdateRequest } from "../models/ContestUpdateRequest";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class ContestControllerService {
  /**
   * addContest
   * @param contestAddRequest contestAddRequest
   * @returns BaseResponse_long_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static addContestUsingPost1(
    contestAddRequest: ContestAddRequest
  ): CancelablePromise<BaseResponse_long_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/add",
      body: contestAddRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * deleteContest
   * @param id id
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static deleteContestUsingPost1(
    id: number
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/delete/{id}",
      path: {
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
   * getContestById
   * @param id id
   * @returns BaseResponse_ContestVO_ OK
   * @throws ApiError
   */
  public static getContestByIdUsingGet1(
    id?: number
  ): CancelablePromise<BaseResponse_ContestVO_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/contest/get",
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
   * listContestByPage
   * @param contestQueryRequest contestQueryRequest
   * @returns BaseResponse_Page_ContestVO_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static listContestByPageUsingPost1(
    contestQueryRequest?: ContestQueryRequest
  ): CancelablePromise<BaseResponse_Page_ContestVO_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/list/page",
      body: contestQueryRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * calculateContestRanking
   * @param id id
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static calculateContestRankingUsingPost1(
    id: number
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/rank/calculate/{id}",
      path: {
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
   * registerContest
   * @param id id
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static registerContestUsingPost1(
    id: number
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/register/{id}",
      path: {
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
   * updateContest
   * @param contestUpdateRequest contestUpdateRequest
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static updateContestUsingPost1(
    contestUpdateRequest: ContestUpdateRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/contest/update",
      body: contestUpdateRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
}
