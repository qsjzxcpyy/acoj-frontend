import type { BaseResponse_List_ContestProblemStatisticsVO_ } from "../models/BaseResponse_List_ContestProblemStatisticsVO_";
import type { BaseResponse_List_ContestQuestionSubmitVO_ } from "../models/BaseResponse_List_ContestQuestionSubmitVO_";
import type { BaseResponse_long_ } from "../models/BaseResponse_long_";
import type { BaseResponse_Page_ContestRankDetailVO_ } from "../models/BaseResponse_Page_ContestRankDetailVO_";
import type { BaseResponse_Page_ContestVO_ } from "../models/BaseResponse_Page_ContestVO_";
import type { ContestAddRequest } from "../models/ContestAddRequest";
import type { ContestQueryRequest } from "../models/ContestQueryRequest";
import type { ContestUpdateRequest } from "../models/ContestUpdateRequest";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import { BaseResponse_boolean_ } from "../models/BaseResponse_boolean_";
import { BaseResponse_ContestVO_ } from "../models/BaseResponse_ContestVO_";
import { BaseResponse_ContestRankDetailVO_ } from "../models/BaseResponse_ContestRankDetailVO_";

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
   * checkQuestionInOngoingContest
   * @param questionId questionId
   * @returns BaseResponse_boolean_ OK
   * @throws ApiError
   */
  public static checkQuestionInOngoingContestUsingGet1(
    questionId: number
  ): CancelablePromise<BaseResponse_boolean_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/contest/check/question/{questionId}",
      path: {
        questionId: questionId,
      },
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
   * getContestProblemStatistics
   * @param contestId contestId
   * @returns BaseResponse_List_ContestProblemStatisticsVO_ OK
   * @throws ApiError
   */
  public static getContestProblemStatisticsUsingGet1(
    contestId: number
  ): CancelablePromise<BaseResponse_List_ContestProblemStatisticsVO_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/contest/problem/statistics/{contestId}",
      path: {
        contestId: contestId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * getContestRankDetail
   * @param contestId contestId
   * @param current current
   * @param pageSize pageSize
   * @returns BaseResponse_Page_ContestRankDetailVO_ OK
   * @throws ApiError
   */
  public static getContestRankDetailUsingGet1(
    contestId: number,
    current = 1,
    pageSize = 10
  ): CancelablePromise<BaseResponse_Page_ContestRankDetailVO_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/contest/rank/detail/{contestId}",
      path: {
        contestId: contestId,
      },
      query: {
        current: current,
        pageSize: pageSize,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * getMyContestRank
   * @param contestId contestId
   * @returns BaseResponse_ContestRankDetailVO_ OK
   * @throws ApiError
   */
  public static getMyContestRankUsingGet1(
    contestId: number
  ): CancelablePromise<BaseResponse_ContestRankDetailVO_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/contest/rank/my/{contestId}",
      path: {
        contestId: contestId,
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

  /**
   * getUserContestSubmissions
   * @param contestId contestId
   * @returns BaseResponse_List_ContestQuestionSubmitVO_ OK
   * @throws ApiError
   */
  public static getUserContestSubmissionsUsingGet1(
    contestId: number
  ): CancelablePromise<BaseResponse_List_ContestQuestionSubmitVO_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/contest/user/submissions/{contestId}",
      path: {
        contestId: contestId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
}
