import { RestTraceData } from "imcore-ajax-core";
import React from "react";
import JSONView from "react-json-view";
import "./RESTTrace.scss";

export default function RESTTrace({
    data: {
        method,
        route,
        body,
        response
    }
}: { data: RestTraceData }) {
    return (
        <div className="rest-trace-entry">
            Request
            <div className="rest-trace-label">
                <code className="rest-trace-method">{method}</code>
                <code className="rest-trace-url">{route}</code>
            </div>
            <div className="rest-trace-data">
                {
                    body ? (
                        <div className="rest-trace-request-body">
                            <JSONView name={null} collapsed={true} src={typeof body === "string" ? JSON.parse(body) : body} />
                        </div>
                    ) : null
                }
                {
                    response ? (
                        <div className="rest-trace-response">
                            Response
                            <code className="rest-trace-response-status">{response.status}</code>
                            {
                                response.body ? (
                                    <div className="rest-trace-response-body">
                                        <JSONView name={null} collapsed={true} src={response.body} />
                                    </div>
                                ) : null
                            }
                        </div>
                    ) : null
                }
            </div>
        </div>
    );
}