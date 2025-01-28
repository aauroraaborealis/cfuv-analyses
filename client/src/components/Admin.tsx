import { Link } from "react-router-dom";

export default function Admin() {
  return (
    <>
                <Link
                  to="/assign-analysis"
                  style={{ textDecoration: "none" }}
                >
                  Назначение анализа
                </Link>
                <Link
                  to="/analysis-results"
                  style={{ textDecoration: "none" }}
                >
                  Результаты анализов
                </Link>
    </>
  )
}
